from flask import g

from app.helpers.render import render_json, render_error
import app.models.User


def get_my_profile():
    """
    Returns the logged in user's profile or a JSON with `unauthorized: true`
    """
    if isinstance(g.user, app.models.User.User):
        return render_json(g.user.to_json())
    else:
        return render_json({ 'unauthorized': True })


def get_profile(user_id):
    """
    Returns a user's user_id
    """
    user = app.models.User.User.query.filter_by(id=user_id).first()
    
    if user is None:
        return render_error('user not found'), 400
    else:
        return render_json(user.to_json())
