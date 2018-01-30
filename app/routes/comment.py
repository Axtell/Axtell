from flask import request, abort
from app.controllers import comment
from app.server import server
from app.tasks import markdown
from app.helpers.render import render_json


@server.route("/post/<int:post_id>/comment", methods=["POST"])
def write_post_comment(post_id):
    comment_text = request.form["comment_text"]
    parent_comment = request.form.get("parent_comment", None)
    return comment.create_post_comment(post_id, parent_comment, comment_text)


@server.route("/answer/<int:answer_id>/comment", methods=["POST"])
def write_answer_comment(answer_id):
    comment_text = request.form["comment_text"]
    parent_comment = request.form.get("parent_comment", None)
    return comment.create_answer_comment(answer_id, parent_comment, comment_text)


@server.route("/post/<int:post_id>/comments/<int:comment_id>")
def get_post_comment(post_id, comment_id):
    post_comment = comment.get_post_comment(comment_id)
    rendered_text = markdown.delay(post_comment.text).wait()

    if rendered_text is None:
        return abort(500)

    response = post_comment.to_json()
    response["rendered_text"] = rendered_text
    return render_json(response)


@server.route("/answer/<int:answer_id>/comments/<int:comment_id>")
def get_answer_comment(answer_id, comment_id):
    answer_comment = comment.get_answer_comment(comment_id)
    rendered_text = markdown.delay(answer_comment.text).wait()

    if rendered_text is None:
        return abort(500)

    response = answer_comment.to_json()
    response["rendered_text"] = rendered_text
    return render_json(response)
