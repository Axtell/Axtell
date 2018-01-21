from os import path, getcwd

from time import time
from flask import Flask, g
from flask_assets import Environment, Bundle
from webassets.filter import register_filter
from webassets_browserify import Browserify
from werkzeug.contrib.profiler import ProfilerMiddleware

import config


class PPCGFlask(Flask):
    template_folder = "assets/templates"


server = PPCGFlask("PPCG v2")
server.secret_key = config.secret_skey

if server.debug and config.profile:
    server.config['PROFILE'] = True
    server.config['SQLALCHEMY_ECHO'] = True
    server.wsgi_app = ProfilerMiddleware(server.wsgi_app, restrictions=[30], profile_dir='profiles')

register_filter(Browserify)

@server.before_request
def before_request():
    g.request_start_time = time()

# Flask Assets
assets = Environment(server)
nodebin = path.join(getcwd(), 'node_modules', '.bin')

# CSS
def css_bundle_style(type):
    bundle = Bundle(
        f'scss/entry-{type}.scss',
        filters=('sass', 'autoprefixer', 'cleancss'),
        output=f'css/all-{type}.css'
    )

    bundle.config['SASS_USE_SCSS'] = True
    bundle.config['SASS_SOURCE_MAP'] = 'inline'
    bundle.config['SASS_STYLE'] = 'compressed'
    bundle.config['CLEANCSS_BIN'] = path.join(nodebin, 'cleancss')
    bundle.config['AUTOPREFIXER_BIN'] = path.join(nodebin, 'autoprefixer-cli')
    bundle.config['AUTOPREFIXER_BROWSERS'] = ['IE >= 10', 'Safari >= 7', '> 1%']
    assets.register(f'css_{type}_all', bundle)


css_bundle_style('light')
css_bundle_style('dark')

# JS
js = Bundle('js/main.js', filters=('browserify'), output='lib/main.js')

uglify_args = ['-m', '--mange-props', 'regex=/^_.+$/', '-c']

if server.debug:
    js.config['BROWSERIFY_EXTRA_ARGS'] = ['--debug']
    uglify_args.extend(['--source-map', 'content=inline,includeSources,url=inline'])

js_envs = {
    'GAPI_KEY': config.auth['google']['client-id'],
    'IMGUR_CLIENT_ID': config.auth['imgur']['client-id'],
    'POST_TITLE_MIN': str(config.posts['min_title']),
    'POST_TITLE_MAX': str(config.posts['max_title']),
    'POST_BODY_MIN': str(config.posts['min_len']),
    'POST_BODY_MAX': str(config.posts['max_len']),
    'MIN_USERNAME_LENGTH': str(config.users['min_name_len']),
    'MAX_USERNAME_LENGTH': str(config.users['max_name_len']),
}

js.config['BROWSERIFY_BIN'] = path.join(nodebin, 'browserify')
js.config['UGLIFYJS_BIN'] = path.join(nodebin, 'uglifyjs')
js.config['UGLIFYJS_EXTRA_ARGS'] = uglify_args
js.config['BROWSERIFY_TRANSFORMS'] = [
    'babelify',
    ['envify', *[arg for (key, value) in js_envs.items() for arg in ('--' + key, value)]]
]

assets.register('js_all', js)
