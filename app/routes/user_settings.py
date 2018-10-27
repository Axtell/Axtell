from flask import session, request, redirect, g, abort
from app.models.Theme import Theme
from app.models.User import User
from app.server import server
from app.instances import db
from app.helpers.render import render_template, render_json
from app.controllers import user_settings
from app.session.csrf import csrf_protected


def do_redirect():
    redirect_url = request.args.get('redirect')
    if redirect_url is not None:
        return redirect(redirect_url, code=303)
    else:
        return "", 204


@server.route("/settings")
def profile_settings():
    if g.user is None:
        do_redirect()

    return render_template('settings.html')


@server.route("/theme/light", methods=['POST'])
@csrf_protected
def set_light_theme():
    session['theme'] = 'light'
    if g.user is not None:
        g.user.theme = Theme.query.filter_by(name='light').first().id
        db.session.commit()
    return do_redirect()


@server.route("/theme/dark", methods=['POST'])
@csrf_protected
def set_dark_theme():
    session['theme'] = 'dark'
    if g.user is not None:
        g.user.theme = Theme.query.filter_by(name='dark').first().id
        db.session.commit()
    return do_redirect()


@server.route("/preferences/email", methods=['POST'])
@csrf_protected
def set_email():
    try:
        new_email = request.form['email']
    except KeyError:
        return abort(400)

    return user_settings.set_email(new_email) or do_redirect()


@server.route("/preferences/name", methods=['POST'])
@csrf_protected
def set_name():
    try:
        new_name = request.form['name']
    except KeyError:
        return abort(400)

    return user_settings.set_name(new_name) or do_redirect()


@server.route("/preferences/avatar", methods=['POST'])
@csrf_protected
def set_avatar():
    try:
        new_avatar_source = request.form['avatar']
    except KeyError:
        return abort(400)

    return user_settings.set_avatar(new_avatar_source) or do_redirect()


@server.route("/preferences/profile", methods=['POST'])
@csrf_protected
def set_profile_preferences():
    if g.user is None:
        return abort(401)

    data = request.get_json()

    try:
        new_email = data.get('settings-profile-email', g.user.email)
        new_name = data.get('settings-profile-displayname', g.user.name)
        avatar_url = data.get('avatar-url', g.user.avatar)
        following_is_public = data.get('settings-privacy-public-following', g.user.following_public)
    except KeyError:
        return abort(400)

    return \
        user_settings.set_email(new_email) or \
        user_settings.set_name(new_name) or \
        user_settings.set_avatar(avatar_url) or \
        user_settings.set_following_is_public(following_is_public) or \
        do_redirect()


@server.route("/preferences/privacy", methods=['GET'])
@csrf_protected
def get_privacy_preferences():
    if not isinstance(g.user, User):
        return abort(401)

    privacy_preferences = user_settings.get_privacy_settings(g.user)
    return render_json(privacy_preferences)
