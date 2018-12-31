from app.helpers.render import render_error
from app.models.User import User
from functools import wraps

from flask import g, abort


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


def is_admin(f):
    """
    Decorator to check if user is an admin and
    return a JSON response if not
    """

    @wraps(f)
    def wrap(*args, **kwargs):
        if not isinstance(g.user, User):
            return abort(401)
        if not g.user.is_admin:
            return abort(403)

        return f(*args, **kwargs)

    return wrap
