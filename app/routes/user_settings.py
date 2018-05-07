from flask import session, request, redirect, g, abort
from app.models.Theme import Theme
from app.server import server, config
from app.instances.db import db
from app.helpers.render import render_template
from app.controllers import user_settings
from app.forms.user_settings import UserSettingsForm


def do_redirect():
    redirect_url = request.args.get('redirect')
    if redirect_url is not None:
        return redirect(redirect_url, code=303)
    else:
        return "", 204


@server.route("/settings/profile")
def profile_settings():
    if g.user is None:
        do_redirect()

    return render_template('settings/profile.html', form=UserSettingsForm(g.user),
                           max_name_len=config.users['max_name_len'])


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
    try:
        new_email = request.form['email']
    except KeyError:
        return abort(400)

    return user_settings.set_email(new_email) or do_redirect()


@server.route("/preferences/name", methods=['POST'])
def set_name():
    try:
        new_name = request.form['name']
    except KeyError:
        return abort(400)

    return user_settings.set_name(new_name) or do_redirect()


@server.route("/preferences/avatar", methods=['POST'])
def set_avatar():
    try:
        new_avatar_source = request.form['avatar']
    except KeyError:
        return abort(400)

    return user_settings.set_avatar(new_avatar_source) or do_redirect()


@server.route("/preferences/profile", methods=['POST'])
def set_profile_preferences():
    try:
        form = UserSettingsForm(request.POST)
        user_settings.update_profile(form)
        return do_redirect()
    except:
        return abort(400)
