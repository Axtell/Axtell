from flask import Flask
from flask_assets import Environment, Bundle
from os import path, getcwd
from webassets_browserify import Browserify
from webassets.filter import register_filter
import app.helpers.tasks
import config


class PPCGFlask(Flask):
    template_folder = "assets/templates"


server = PPCGFlask("PPCG v2")
server.secret_key = config.secret_skey


@server.before_first_request
def init_celery():
    app.helpers.tasks.init.delay().wait()


register_filter(Browserify)

# Flask Assets
assets = Environment(server)
nodebin = path.join(getcwd(), 'node_modules', '.bin')

# CSS
css = Bundle('scss/main.scss', filters=('scss','autoprefixer','cleancss'), output='css/all.css')
css.config['CLEANCSS_BIN'] = path.join(nodebin, 'cleancss')
css.config['AUTOPREFIXER_BIN'] = path.join(nodebin, 'autoprefixer-cli')
css.config['AUTOPREFIXER_BROWSERS'] = ['> 1%']
assets.register('css_all', css)

# JS
js = Bundle('js/main.js', filters=('browserify',), output='lib/main.js')

if server.debug:
    js.config['BROWSERIFY_EXTRA_ARGS'] = ['--debug']

js.config['BROWSERIFY_BIN'] = 'node_modules/.bin/browserify'
js.config['BROWSERIFY_TRANSFORMS'] = ['babelify']
assets.register('js_all', js)
