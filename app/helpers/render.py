from flask import jsonify, render_template as flask_render_template

import config
from app.server import server
from app.helpers import macros


def render_template(path, **kwargs):
    return flask_render_template(path, **kwargs)

def render_paginated(pagination, predicate=lambda data: data):
    return render_json({
        'data': [predicate(item) for item in pagination.items],
        'are_more': pagination.has_next
    })

def render_json(data):
    data['success'] = True
    return jsonify(data)

def render_enum(enum_json):
    """
    Renders an enum's "json" format. See the
    SerializableEnum class
    """
    return render_json({'enum': enum_json})

def render_error(message, error_type=None):
    error = {'error': True, 'message': message}
    if error_type is not None:
        error['type'] = error_type
    return jsonify(error)
