from app.server import server
from app.controllers import answer
from app.helpers.render import render_error, render_json
from flask import request, redirect

# noinspection PyUnusedLocal
@server.route("/auth/login", methods=['POST'])
def auth_login():
    json = request.get_json(silent=True)
    
    # JSON parsing failed
    if not json or 'token' not in json: return render_error('bad json')

    redirect('/user', code=303)
