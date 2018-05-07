from validate_email import validate_email
from app.helpers.imgur_upload import imgur_upload
from app.instances.db import db
from flask import g, abort

import config


def update_profile(form):
    if g.user is None:
        return abort(403)

    if form.validate():
        if form.avatar_file.data:
            form.avatar.data = imgur_upload(form.avatar_file.data)
        else:
            form.avatar.data = imgur_upload(form.avatar.data)
        form.populate_obj(g.user)
        db.session.commit()
    else:
        return abort(400)


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
