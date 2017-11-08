from flask import Flask
from flask_assets import Environment, Bundle


class PPCGFlask(Flask):
    template_folder = "assets/templates"


server = PPCGFlask("PPCG v2")
# filename='js/manifest.json'
# Flask Assets
assets = Environment(server)

# CSS
css = Bundle('scss/main.scss', filters='scss,autoprefixer6,cleancss', output='css/all.css')
css.config['AUTOPREFIXER_BROWSERS'] = ['> 1%']
assets.register('css_all', css)
