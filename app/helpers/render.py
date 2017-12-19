from flask import jsonify, render_template as flask_render_template

import config
from app.helpers import macros


def render_template(path, **kwargs):
    return flask_render_template(path, **{
        'opts': config,
        'macros': macros,
        **kwargs
    })


def render_json(data):
    data['success'] = True
    return jsonify(data)


def render_error(message, error_type=None):
    error = {'error': True, 'message': message}
    if error_type is not None:
        error['type'] = error_type
    return jsonify(error)
