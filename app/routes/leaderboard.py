from flask import request

from app.helpers.render import render_json
from app.models.Leaderboard import Leaderboard
from app.server import server

@server.route('/leaderboard/<int:post_id>')
def get_leaderboard(post_id):
    return render_json(Leaderboard(post_id=post_id, limit=-1).to_json())
