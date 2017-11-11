from app.server import server
from app.controllers import post
from app.helpers.render import render_template


# noinspection PyUnusedLocal
# @server.route("/post/<int:post_id>")
# @server.route("/post/<int:post_id>/<post_title>")
# def get_post(post_id, post_title=None):
#     post_data = post.get_post(post_id)
#
#     if post_data is None:
#         return render_template('notfound.html'), 404
#
#     return render_template('post.html', post_data=post_data)
