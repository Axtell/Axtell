from flask import request, session, abort
from functools import wraps
from app.server import server
import config

csrf_token_name = 'csrf'

def validate_csrf(csrf_token):
    """
    Determines if a CSRF token as provided is valid
    """

    actual_csrf_token = session.get(csrf_token_name, None)
    return csrf_token == actual_csrf_token

def csrf_protected(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        actual_csrf_token = session.get(csrf_token_name, None)

        if 'csrf_token' in request.form:
            user_csrf_token = request.form['csrf_token']
        elif 'X-CSRF-Token' in request.headers:
            user_csrf_token = request.headers['X-CSRF-Token']
        else:
            user_csrf_token = None

        if not server.debug and \
                (actual_csrf_token is None or user_csrf_token is None or user_csrf_token != actual_csrf_token):
            return abort(403)

        return f(*args, **kwargs)

    return wrap
