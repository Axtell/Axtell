from flask import request, redirect, url_for, abort, g

from app.controllers import auth
from app.helpers.render import render_error, render_json, render_template
from app.server import server
from app.session.user_session import remove_session_user
from app.session.csrf import csrf_protected
import config

from app.helpers.macros.encode import b64_to_json

import requests

# noinspection PyUnusedLocal
@server.route("/auth/login/jwt", methods=['POST'])
def auth_login_jwt():
    json = request.get_json(silent=True)

    # JSON parsing failed
    if not json or 'token' not in json:
        return render_error('bad json')

    jwt_errors = auth.set_user_jwt(json['token'], json.get('profile'))
    if jwt_errors is not None:
        return jwt_errors
    else:
        return render_json({'user_id': g.user.id})


@server.route("/auth/login/oauth")
def auth_login_oauth():
    # OAuth code
    code = request.args.get('code')

    # State identifies provider
    try:
        state = b64_to_json(request.args.get('state'))
    except:
        return abort(400)

    provider = state.get('provider')

    if state.get('target_client', False):
        auth_key = auth.set_user_oauth(code, provider=provider, client_side=True)
        if isinstance(auth_key, str):
            return render_template('client_oauth/success.html', auth_key=auth_key)
        elif auth_key is None:
            return render_template('client_oauth/failed.html')
        else:
            # In this case auth_key is errors
            return auth_key
    else:
        oauth_errors = auth.set_user_oauth(code, provider=provider, client_side=False)

        if oauth_errors is not None:
            return oauth_errors
        else:
            return redirect(state.get('redirect', url_for('home')), 303)


@server.route("/auth/methods/list", methods=['GET'])
@csrf_protected
def auth_method_list():
    if g.user is None:
        return abort(401)

    methods = auth.get_auth_methods(user=g.user)

    return render_json({'methods': methods})


@server.route("/auth/logout", methods=['POST'])
def auth_logout():
    remove_session_user()
    redirect_url = request.args.get('redirect') or '/'
    return redirect(redirect_url, code=303)


@server.route("/auth/loginhack")
def auth_hack():
    if not config.app.get('debug', False):
        return abort(404)
    auth.auth_hack()
    redirect_url = request.args.get('redirect') or '/'
    return redirect(redirect_url, code=303)
