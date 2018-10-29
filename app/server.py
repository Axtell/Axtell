from os import path, getcwd
from time import time

from flask import Flask, g
from werkzeug.contrib.profiler import ProfilerMiddleware
from werkzeug.routing import IntegerConverter as BaseIntegerConverter

from bugsnag.flask import handle_exceptions
import bugsnag

import app.tasks.update as update
import app.tasks.search as search

from app.models import *
from app.instances import db

from app.instances.celery import redis_url
from app.helpers import macros
import golflang_encodings
import config


class AxtellFlask(Flask):
    template_folder = "assets/templates"

server = AxtellFlask("Axtell")
server.secret_key = config.secret_skey


# Converters
class SignedIntegerConverter(BaseIntegerConverter):
    regex = r'-?\d+'

server.url_map.converters['sint'] = SignedIntegerConverter


# Setup SQL models
@server.before_first_request
def setup_database():
    db.Model.metadata.create_all(bind=db.engine)
    # SQLAlchemy doesn't have native support for MySQL views,
    # so we use raw SQL here - need to find a better method eventually
    db.session.execute("""
    CREATE OR REPLACE VIEW `duplicate_users` AS
        SELECT
            `login_ips`.`ip_address` AS `ip_address`,
            GROUP_CONCAT(`login_ips`.`user_id`
                SEPARATOR ',') AS `user_ids`,
            GROUP_CONCAT(QUOTE(`users`.`name`)
                SEPARATOR ',') AS `usernames`
        FROM
            ((SELECT DISTINCT
                `logins`.`ip_address` AS `ip_address`,
                    `logins`.`user_id` AS `user_id`
            FROM
                `logins`) `login_ips`
            JOIN `users` ON ((`users`.`id` = `login_ips`.`user_id`)))
        GROUP BY `login_ips`.`ip_address`
        HAVING (COUNT(`login_ips`.`user_id`) > 1)
    """)

@server.teardown_appcontext
def teardown_database(exception=None):
    db.session.remove()


# Jinja Setup
server.jinja_env.globals['opts'] = config
server.jinja_env.globals['is_debug'] = server.debug
server.jinja_env.globals['macros'] = macros

@server.template_filter('pluralize')
def pluralize(number, name, plural="s"):
    if number == 1:
        return f"{number} {name}"
    else:
        return f"{number} {name}{plural}"


# Setup Bugsnag if info is provided
if config.auth['bugsnag'].get('backend', ''):
    bugsnag.configure(
        api_key=config.auth['bugsnag'].get('backend', ''),
        project_root=getcwd(),
        auto_capture_sessions=True
    )
    handle_exceptions(server)


# If profiling is enabled setup the middlware
if server.debug and config.profile:
    server.config['PROFILE'] = True
    server.config['SQLALCHEMY_ECHO'] = True
    server.wsgi_app = ProfilerMiddleware(server.wsgi_app, restrictions=[30], profile_dir='profiles')


# Get the first set of JWT keys
update.jwt_update.delay().wait()

# Do search indexing
search.initialize_indices.delay().wait()


# Used to measure request duration
@server.before_request
def before_request():
    g.request_start_time = time()
