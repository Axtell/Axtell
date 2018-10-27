from validate_email import validate_email
from app.models.User import User
from app.helpers.imgur_upload import imgur_upload
from app.instances import db
from flask import g, abort

import config


def set_email(new_email):
    if g.user is None:
        return abort(403)

    if not validate_email(new_email):
        return abort(400)

    g.user.email = new_email
    db.session.commit()


def set_name(new_name):
    if g.user is None:
        return abort(403)

    if not isinstance(new_name, str):
        return abort(401)

    if not config.users['min_name_len'] <= len(new_name) <= config.users['max_name_len']:
        return abort(400)

    g.user.name = new_name
    db.session.commit()


def set_avatar(avatar_url):
    if not avatar_url:
        pass

    if g.user is None:
        return abort(403)

    try:
        new_avatar = imgur_upload(avatar_url)
    except RuntimeError:
        return abort(400)
    g.user.avatar = new_avatar
    db.session.commit()


def set_following_is_public(following_is_public):
    if g.user is None:
        return abort(403)

    if not isinstance(following_is_public, bool):
        return abort(401)

    g.user.following_public = following_is_public
    db.session.commit()

def get_privacy_settings(user):
    return {'following_is_public': user.following_public}
