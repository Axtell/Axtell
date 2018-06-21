from os import path, getcwd

from time import time
from flask import Flask, g
from werkzeug.contrib.profiler import ProfilerMiddleware
from werkzeug.routing import IntegerConverter as BaseIntegerConverter
import app.tasks.update as update
from shutil import which
import bugsnag
from bugsnag.flask import handle_exceptions
from app.helpers import macros
import golflang_encodings
import config


class AxtellFlask(Flask):
    template_folder = "assets/templates"


server = AxtellFlask("Axtell")
server.secret_key = config.secret_skey


class SignedIntegerConverter(BaseIntegerConverter):
    regex = r'-?\d+'

server.url_map.converters['sint'] = SignedIntegerConverter


server.jinja_env.globals['opts'] = config
server.jinja_env.globals['is_debug'] = server.debug
server.jinja_env.globals['macros'] = macros


# Setup Bugsnag if info is provided
if config.auth['bugsnag'].get('backend', ''):
    bugsnag.configure(
        api_key=config.auth['bugsnag'].get('backend', ''),
        project_root=getcwd(),
        auto_capture_sessions=True
    )
    handle_exceptions(server)


if server.debug and config.profile:
    server.config['PROFILE'] = True
    server.config['SQLALCHEMY_ECHO'] = True
    server.wsgi_app = ProfilerMiddleware(server.wsgi_app, restrictions=[30], profile_dir='profiles')

update.jwt_update.delay().wait()


@server.before_request
def before_request():
    g.request_start_time = time()
