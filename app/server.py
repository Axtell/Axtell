from os import path, getcwd

from time import time
from flask import Flask, g
from werkzeug.contrib.profiler import ProfilerMiddleware
import app.tasks.update as update

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
