from flask import jsonify, render_template as flask_render_template
from app.helpers import macros
import config

def render_template(path, **kwargs):
    return flask_render_template(path, **{
        'opts': config,
        'macros': macros,
        **kwargs
    })

def render_json(data):
    data['success'] = True
    return jsonify(data)

def render_error(message, type=None):
    error = { 'error': True, 'message': message }
    if type is not None: error['type'] = type
    return jsonify(error)
