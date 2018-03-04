from app.models.PostComment import PostComment
from app.models.AnswerComment import AnswerComment
from app.models.Post import Post
from app.models.Answer import Answer
from app.instances.db import db
from flask import g, abort, redirect, url_for
from config import comments


def get_post_comment(comment_id):
    comment = PostComment.query.filter_by(id=comment_id).first()

    if comment is None:
        return abort(404)

    return comment


def get_answer_comment(comment_id):
    comment = AnswerComment.query.filter_by(id=comment_id).first()

    if comment is None:
        return abort(404)

    return comment


def create_post_comment(post_id, parent_comment, comment_text):
    if g.user is None:
        return abort(403)

    if not comments["min_len"] <= len(comment_text) <= comments["max_len"]:
        return abort(400)

    post = Post.query.filter_by(id=post_id).first()
    new_comment = PostComment(post_id=post_id, parent_id=parent_comment, text=comment_text, user_id=g.user.id)
    post.comments.append(new_comment)
    g.user.post_comments.append(new_comment)

    db.session.add(new_comment)
    db.session.commit()

    return redirect(url_for('get_post', post_id=post_id))


def create_answer_comment(answer_id, parent_comment, comment_text):
    if g.user is None:
        return abort(403)

    if not comments["min_len"] <= len(comment_text) <= comments["max_len"]:
        return abort(400)

    answer = Answer.query.filter_by(id=answer_id).first()

    new_comment = AnswerComment(answer_id=answer_id, parent_id=parent_comment, text=comment_text, user_id=g.user.id)
    answer.comments.append(new_comment)
    g.user.answer_comments.append(new_comment)

    db.session.add(new_comment)
    db.session.commit()

    return redirect(url_for('get_post', post_id=answer.post_id, answer_id=answer_id) + f"#answer-{answer_id}")
