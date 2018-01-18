from flask import session, request, redirect, g, abort
from app.models.Theme import Theme
from app.server import server
from app.instances.db import db
from app.helpers.imgur_upload import imgur_upload
from validate_email import validate_email


def do_redirect():
    redirect_url = request.args.get('redirect') or '/'
    return redirect(redirect_url, code=303)


@server.route("/theme/light", methods=['POST'])
def set_light_theme():
    session['theme'] = 'light'
    if g.user is not None:
        g.user.theme = Theme.query.filter_by(name='light').first().id
        db.session.commit()
    return do_redirect()


@server.route("/theme/dark", methods=['POST'])
def set_dark_theme():
    session['theme'] = 'dark'
    if g.user is not None:
        g.user.theme = Theme.query.filter_by(name='dark').first().id
        db.session.commit()
    return do_redirect()


@server.route("/preferences/email", methods=['POST'])
def set_email():
    if g.user is None:
        return abort(403)
    try:
        new_email = request.form['email']
    except KeyError:
        return abort(400)
    if not validate_email(new_email):
        return abort(400)
    g.user.email = new_email
    db.session.commit()
    return do_redirect()


@server.route("/preferences/name", methods=['POST'])
def set_name():
    if g.user is None:
        return abort(403)
    try:
        new_name = request.form['name']
    except KeyError:
        return abort(400)
    g.user.name = new_name
    db.session.commit()
    return do_redirect()


@server.route("/preferences/avatar", methods=['POST'])
def set_avatar():
    if g.user is None:
        return abort(403)
    try:
        new_avatar_source = request.form['avatar']
    except KeyError:
        return abort(400)
    try:
        new_avatar = imgur_upload(new_avatar_source)
    except RuntimeError:
        return abort(400)
    g.user.avatar = new_avatar
    db.session.commit()
    return do_redirect()
