from flask import render_template as flask_render_template
import config

def render_template(path, **kwargs):
    return flask_render_template(path, **{ 'opts': config, **kwargs })
