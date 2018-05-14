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


def get_answer_comments_page(answer_id, page_id):
    comment_list = [comment.to_json() for comment in AnswerComment.query \
        .filter_by(answer_id=answer_id) \
        .order_by(AnswerComment.date_created.desc()) \
        .offset(comments['show_amt'] * page_id) \
        .limit(comments['show_amt']) \
        .all()]

    # Check the amount of comments, that (would be returned) (this is the comments['show_amt'] * page + 1) is at least
    # as many as they actually are.
    are_more_comments = AnswerComment.query.filter_by(answer_id=answer_id).count() - comments['show_amt'] * (page_id + 1) <= 0
    return {'comments': comment_list, 'are_more': are_more_comments}


def get_post_comments_page(post_id, page_id):
    comment_list = [comment.to_json() for comment in PostComment.query \
        .filter_by(post_id=post_id) \
        .order_by(PostComment.date_created.desc()) \
        .offset(comments['show_amt'] * page_id) \
        .limit(comments['show_amt']) \
        .all()]

    # Check the amount of comments, that (would be returned) (this is the comments['show_amt'] * page + 1) is at least
    # as many as they actually are.
    no_more_comments = PostComment.query.filter_by(post_id=post_id).count() - comments['show_amt'] * (page_id + 1) <= 0
    return {'comments': comment_list, 'are_more': not no_more_comments}


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

    return new_comment


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

    return new_comment


def delete_post_comment(comment_id):
    comment = get_post_comment(comment_id)
    comment.deleted = True
    db.session.commit()


def delete_answer_comment(comment_id):
    comment = get_answer_comment(comment_id)
    comment.deleted = True
    db.session.commit()
