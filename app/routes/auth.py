from flask import request, redirect, url_for, abort

from app.controllers import auth
from app.helpers.render import render_error
from app.server import server
from app.session.user_session import remove_session_user

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
        return render_json({'user_id': user.id})


@server.route("/auth/login/oauth")
def auth_login_oauth():
    # OAuth code
    code = request.args.get('code')

    # State identifies provider
    try:
        state = b64_to_json(request.args.get('state'))
    except:
        return abort(400)

    oauth_errors = auth.set_user_oauth(code, provider=state.get('provider'))

    if oauth_errors is not None:
        return oauth_errors
    else:
        return redirect(state.get('redirect', url_for('home')), 303)


@server.route("/auth/logout", methods=['POST'])
def auth_logout():
    remove_session_user()
    redirect_url = request.args.get('redirect') or '/'
    return redirect(redirect_url, code=303)
