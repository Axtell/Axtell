from flask import Flask
from flask_assets import Environment, Bundle

class PPCGFlask(Flask):
    template_folder="assets/templates"

server = PPCGFlask("PPCG v2")

# Flask Assets
assets = Environment(server)

## SCSS
scss = Bundle('scss/main.scss', filters='pyscss', output='css/all.css')
assets.register('scss_all', scss)
