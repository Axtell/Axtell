from flask import request, abort, redirect, url_for
from app.controllers import comment
from app.server import server
from app.tasks import markdown
from app.helpers.render import render_json
from app.session.csrf import csrf_protected


@server.route("/post/<int:post_id>/comment", methods=["POST"])
@csrf_protected
def write_post_comment(post_id):
    comment_text = request.form["comment_text"]
    parent_comment = request.form.get("parent_comment", None)
    new_comment = comment.create_post_comment(post_id, parent_comment, comment_text)
    return render_json(new_comment.to_json())


@server.route("/answer/<int:answer_id>/comment", methods=["POST"])
@csrf_protected
def write_answer_comment(answer_id):
    comment_text = request.form["comment_text"]
    parent_comment = request.form.get("parent_comment", None)
    new_comment = comment.create_answer_comment(answer_id, parent_comment, comment_text)
    return render_json(new_comment.to_json())


@server.route("/post/<int:post_id>/comment/<int:comment_id>/edit", methods=["POST"])
@csrf_protected
def edit_post_comment(post_id, comment_id):
    comment_text = request.form["comment_text"]
    edited_comment = comment.edit_post_comment(comment_id, comment_text)
    return render_json(edited_comment.to_json())


@server.route("/answer/<int:answer_id>/comment/<int:comment_id>/edit", methods=["POST"])
@csrf_protected
def edit_answer_comment(answer_id, comment_id):
    comment_text = request.form["comment_text"]
    edited_comment = comment.edit_answer_comment(comment_id, comment_text)
    return render_json(edited_comment.to_json())


@server.route("/answer/<int:answer_id>/comments/parent/<sint:parent_id>/page/<int:page_id>", defaults={'initial_offset': 0})
@server.route("/answer/<int:answer_id>/comments/parent/<sint:parent_id>/page/<int:page_id>/offset/<int:initial_offset>")
def get_answer_comments_page(answer_id, parent_id, page_id, initial_offset):
    comments = comment.get_answer_comments_page(answer_id, parent_id, page_id, initial_offset)
    return render_json(comments)


@server.route("/post/<int:post_id>/comments/parent/<sint:parent_id>/page/<int:page_id>", defaults={'initial_offset': 0})
@server.route("/post/<int:post_id>/comments/parent/<sint:parent_id>/page/<int:page_id>/offset/<int:initial_offset>")
def get_post_comments_page(post_id, parent_id, page_id, initial_offset):
    comments = comment.get_post_comments_page(post_id, parent_id, page_id, initial_offset)
    return render_json(comments)


@server.route("/post/<int:post_id>/comment/<int:comment_id>")
def get_post_comment(post_id, comment_id):
    post_comment = comment.get_post_comment(comment_id)
    response = post_comment.to_json()
    return render_json(response)


@server.route("/answer/<int:answer_id>/comment/<int:comment_id>")
def get_answer_comment(answer_id, comment_id):
    answer_comment = comment.get_answer_comment(comment_id)
    response = answer_comment.to_json()
    return render_json(response)


@server.route("/post/<int:post_id>/comment/<int:comment_id>", methods=['DELETE'])
def delete_post_comment(post_id, comment_id):
    try:
        comment.delete_post_comment(comment_id)
    except PermissionError:
        return abort(403)
    response = {
        'comment_id': comment_id,
        'deleted': True
    }
    return render_json(response)


@server.route("/answer/<int:answer_id>/comment/<int:comment_id>", methods=['DELETE'])
def delete_answer_comment(answer_id, comment_id):
    try:
        comment.delete_answer_comment(comment_id)
    except PermissionError:
        return abort(403)
    response = {
        'comment_id': comment_id,
        'deleted': True
    }
    return render_json(response)
