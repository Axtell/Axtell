from validate_email import validate_email
from app.instances.db import db
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

    if not config.users['min_name_len'] <= len(new_name) <= config.users['max_name_len']:
        return abort(400)

    g.user.name = new_name
    db.session.commit()
