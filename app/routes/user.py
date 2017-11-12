from app.server import server
from app.controllers import user
from app.helpers.render import render_error, render_json
from flask import request

# noinspection PyUnusedLocal
@server.route("/user/me", methods=['GET'])
def get_my_profile():
    return user.get_my_profile()
