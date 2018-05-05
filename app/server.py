from os import path, getcwd

from time import time
from flask import Flask, g
from werkzeug.contrib.profiler import ProfilerMiddleware
import app.tasks.update as update
from shutil import which

import config


class AxtellFlask(Flask):
    template_folder = "assets/templates"


server = AxtellFlask("Axtell")
server.secret_key = config.secret_skey

if server.debug and config.profile:
    server.config['PROFILE'] = True
    server.config['SQLALCHEMY_ECHO'] = True
    server.wsgi_app = ProfilerMiddleware(server.wsgi_app, restrictions=[30], profile_dir='profiles')

update.jwt_update.delay().wait()


@server.before_request
def before_request():
    g.request_start_time = time()


# CSS

# bundle.config['AUTOPREFIXER_BROWSERS'] = ['Safari >= 8', '> 1%']
# assets.register(f'css_{type}_all', bundle)

# js_envs = {
#     'GAPI_KEY': config.auth['google']['client-id'],
#     'IMGUR_CLIENT_ID': config.auth['imgur']['client-id'],
#     'POST_TITLE_MIN': str(config.posts['min_title']),
#     'POST_TITLE_MAX': str(config.posts['max_title']),
#     'POST_BODY_MIN': str(config.posts['min_len']),
#     'POST_BODY_MAX': str(config.posts['max_len']),
#     'MIN_USERNAME_LENGTH': str(config.users['min_name_len']),
#     'MAX_USERNAME_LENGTH': str(config.users['max_name_len']),
#     'MIN_COMMENT_LENGTH': str(config.comments['min_len']),
#     'MAX_COMMENT_LENGTH': str(config.comments['max_len']),
#     'IS_DEBUG': 'true' if server.debug else ''
# }
