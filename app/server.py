from flask import Flask
from flask_assets import Environment, Bundle
from os import path, getcwd
from webassets_browserify import Browserify
from webassets.filter import register_filter
import config


class PPCGFlask(Flask):
    template_folder = "assets/templates"


server = PPCGFlask("PPCG v2")
server.secret_key = config.secret_skey

register_filter(Browserify)

# Flask Assets
assets = Environment(server)
nodebin = path.join(getcwd(), 'node_modules', '.bin')

# CSS
css_light = Bundle('scss/entry-light.scss', filters=('scss','autoprefixer','cleancss'), output='css/all.css')
css_light.config['CLEANCSS_BIN'] = path.join(nodebin, 'cleancss')
css_light.config['AUTOPREFIXER_BIN'] = path.join(nodebin, 'autoprefixer-cli')
css_light.config['AUTOPREFIXER_BROWSERS'] = ['> 1%']
assets.register('css_light_all', css_light)

css_dark = Bundle('scss/entry-dark.scss', filters=('scss','autoprefixer','cleancss'), output='css/all-dark.css')
css_dark.config['CLEANCSS_BIN'] = path.join(nodebin, 'cleancss')
css_dark.config['AUTOPREFIXER_BIN'] = path.join(nodebin, 'autoprefixer-cli')
css_dark.config['AUTOPREFIXER_BROWSERS'] = ['> 1%']
assets.register('css_dark_all', css_dark)

# JS
js = Bundle('js/main.js', filters=('browserify',), output='lib/main.js')

if server.debug:
    js.config['BROWSERIFY_EXTRA_ARGS'] = ['--debug']

js_envs = {
    'GAPI_KEY': config.auth['google']['client-id'],
    'POST_TITLE_MIN': str(config.posts['min_title']),
    'POST_TITLE_MAX': str(config.posts['max_title']),
    'POST_BODY_MIN': str(config.posts['min_len']),
    'POST_BODY_MAX': str(config.posts['max_len'])
}

js.config['BROWSERIFY_BIN'] = 'node_modules/.bin/browserify'
js.config['BROWSERIFY_TRANSFORMS'] = [
    'babelify',
    ['envify', *[arg for (key, value) in js_envs.items() for arg in ('--' + key, value)]]
]
assets.register('js_all', js)
