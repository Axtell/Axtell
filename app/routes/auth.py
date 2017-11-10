from app.server import server
from app.controllers import auth, user
from app.helpers.render import render_error, render_json
from flask import request, redirect

# noinspection PyUnusedLocal
@server.route("/auth/login", methods=['POST'])
def auth_login():
    json = request.get_json(silent=True)
    
    # JSON parsing failed
    if not json or 'token' not in json: return render_error('bad json')

    auth.set_user(json)
    redirect('/user', code=303)

@server.route("/auth/logout", methods=['POST'])
def auth_logout():
    user.logout()
