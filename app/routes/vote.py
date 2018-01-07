from flask import request, g, abort

from app.controllers import vote
from app.server import server
from app.helpers.render import render_json


@server.route("/votes/post/<int:post_id>")
def post_votes(post_id):
    return vote.get_post_vote_sum(post_id)


@server.route("/votes/answer/<int:answer_id>")
def answer_votes(answer_id):
    return vote.get_answer_vote_sum(answer_id)


@server.route("/vote/post/<int:post_id>", methods=['GET', 'POST'])
def post_vote(post_id):
    if request.method == 'GET':
        return render_json(vote.get_post_vote(post_id))
    vote_data = render_json(request.get_json(silent=True)['vote'])
    return render_json(vote.do_post_vote(post_id, vote_data))


@server.route("/vote/answer/<int:answer_id>", methods=['GET', 'POST'])
def answer_vote(answer_id):
    if request.method == 'GET':
        return render_json(vote.get_answer_vote(answer_id))
    vote_data = request.get_json(silent=True)['vote']
    return render_json(vote.do_answer_vote(answer_id, vote_data))
