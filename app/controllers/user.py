from flask import g, session
from app.helpers.render import render_json, render_error
from app.models.User import User


def get_my_profile():
    """
    Returns the logged in user's profile or a JSON with `unauthorized: true`
    """
    if isinstance(g.user, User):
        return render_json(g.user.to_json())
    else:
        return render_json({ 'unauthorized': True })
