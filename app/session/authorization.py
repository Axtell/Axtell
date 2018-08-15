from app.helpers.render import render_json
from app.models.User import User
from functools import wraps

from flask import g

def is_authorized_json(f):
    """
    Decorator to check if user is authorized and
    return a JSON response if otherwise
    """

    @wraps(f)
    def wrap(*args, **kwargs):
        if not isinstance(g.user, User):
            return render_error('Unauthorized'), 401

        return f(*args, **kwargs)

    return wrap
