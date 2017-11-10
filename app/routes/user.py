from app.server import server
from app.controllers import user
from app.helpers.render import render_error, render_json
from flask import request

# noinspection PyUnusedLocal
@server.route("/user", methods=['GET'])
def get_profile():
    return render_json({ 'id': -1 })
