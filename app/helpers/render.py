from flask import jsonify, render_template as flask_render_template
import config

def render_template(path, **kwargs):
    return flask_render_template(path, **{ 'opts': config, **kwargs })

def render_json(data):
    data['success'] = True
    return jsonify(data)

def render_error(message):
    return jsonify({ 'error': True, 'message': message })
