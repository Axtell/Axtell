from app.server import server
from app.controllers import answer
from app.helpers.render import render_template


# noinspection PyUnusedLocal
# @server.route("/post/<int:post_id>/<post_title>/answer/<int:answer_id>")
# def get_answer(post_id, post_title, answer_id):
#     post_data = answer.get_answer(post_id, answer_id)
#
#     if post_data is None:
#         return render_template('notfound.html'), 404
#
#     return render_template('answer.html', post_data=post_data)
#
#
# @server.route("/post/<int:post_id>/answer/<int:answer_id>")
# def get_answer_no_post_id(post_id, answer_id):
#     post_data = answer.get_answer(post_id, answer_id)
#
#     if post_data is None:
#         return render_template('notfound.html'), 404
#
#     return render_template('answer.html', post_data=post_data)
