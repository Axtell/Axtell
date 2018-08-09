from app.models.PostComment import PostComment
from app.models.AnswerComment import AnswerComment
from app.models.Post import Post
from app.models.Answer import Answer
from app.instances.db import db
from app.models.Notification import Notification, NotificationType
from app.notifications.send_notification import send_notification
from app.helpers.comments import get_comment_notification_targets
from flask import g, abort, redirect, url_for
from config import comments


def get_post_comment(comment_id):
    comment = PostComment.query.filter_by(id=comment_id, deleted=False).first()

    if comment is None:
        return abort(404)

    return comment


def get_answer_comment(comment_id):
    comment = AnswerComment.query.filter_by(id=comment_id, deleted=False).first()

    if comment is None:
        return abort(404)

    return comment


def get_answer_comments_page(answer_id, parent_id, page_id, initial_offset):
    if parent_id == -1:
        offset = comments['show_amt'] * page_id
        sql_parent = None
    else:
        offset = comments['show_amt'] * (page_id - 1) + initial_offset
        sql_parent = parent_id

    comment_list = [comment.to_json(show_parent=False) for comment in AnswerComment.query \
        .filter_by(answer_id=answer_id, parent_id=sql_parent, deleted=False) \
        .order_by(AnswerComment.date_created.desc()) \
        .offset(offset) \
        .limit(comments['show_amt']) \
        .all()]

    # Check the amount of comments, that (would be returned) (this is the comments['show_amt'] * page + 1) is at least
    # as many as they actually are.
    comments_remaining = AnswerComment.query.filter_by(answer_id=answer_id, parent_id=sql_parent).count() - ( offset + comments['show_amt'] )
    return {'comments': comment_list, 'are_more': comments_remaining > 0}


def get_post_comments_page(post_id, parent_id, page_id, initial_offset):
    if parent_id == -1:
        offset = comments['show_amt'] * page_id
        sql_parent = None
    else:
        # remember x_n = r(n-1)+d from grade school
        offset = comments['show_amt'] * (page_id - 1) + initial_offset
        sql_parent = parent_id

    comment_list = [comment.to_json(show_parent=False) for comment in PostComment.query \
        .filter_by(post_id=post_id, parent_id=sql_parent, deleted=False) \
        .order_by(PostComment.date_created.desc()) \
        .offset(offset) \
        .limit(comments['show_amt']) \
        .all()]

    # Check the amount of comments, that (would be returned) (this is the comments['show_amt'] * page + 1) is at least
    # as many as they actually are.
    total_comments = PostComment.query.filter_by(post_id=post_id, parent_id=sql_parent).count()
    comments_remaining = total_comments - ( offset + comments['show_amt'] )
    return {'comments': comment_list, 'are_more': comments_remaining > 0, 'total': total_comments}


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

    # Get the users that we should send notification to
    comments_to_notify = get_comment_notification_targets(new_comment)

    for user_id, comment in comments_to_notify.items():
        # Dont notify user if:
        #  - is the owner of the post
        #  - is the owner of the new comment

        if user_id in (post.user_id, new_comment.user_id):
            continue

        send_notification(Notification(
            sender_id=new_comment.user_id,
            target_id=new_comment.id,
            recipient_id=user_id,
            source_id=comment.id,
            notification_type=NotificationType.NEW_POST_COMMENT
        ))

    # Notify the owner of the post
    send_notification(Notification(
        sender_id=new_comment.user_id,
        target_id=new_comment.id,
        recipient_id=post.user_id,
        source_id=None,
        notification_type=NotificationType.NEW_POST_COMMENT
    ))

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

    # Get the users that we should send notification to
    comments_to_notify = get_comment_notification_targets(new_comment)

    for user_id, comment in comments_to_notify.items():
        # Dont notify user if:
        #  - is the owner of the post
        #  - is the owner of the new comment

        if user_id == (answer.user_id, new_comment.user_id):
            continue

        send_notification(Notification(
            sender_id=new_comment.user_id,
            target_id=new_comment.id,
            recipient_id=user_id,
            source_id=comment.id,
            notification_type=NotificationType.NEW_ANSWER_COMMENT
        ))

    # Notify the owner of the post
    send_notification(Notification(
        sender_id=new_comment.user_id,
        target_id=new_comment.id,
        recipient_id=answer.user_id,
        source_id=None,
        notification_type=NotificationType.NEW_ANSWER_COMMENT
    ))

    return new_comment


def delete_post_comment(comment_id):
    comment = get_post_comment(comment_id)
    if g.user.id != comment.user_id:
        raise PermissionError
    comment.deleted = True
    db.session.commit()


def delete_answer_comment(comment_id):
    comment = get_answer_comment(comment_id)
    if g.user.id != comment.user_id:
        raise PermissionError
    comment.deleted = True
    db.session.commit()


def edit_post_comment(comment_id, comment_text):
    comment = get_post_comment(comment_id)
    comment.text = comment_text
    db.session.commit()


def edit_answer_comment(comment_id, comment_text):
    comment = get_answer_comment(comment_id)
    comment.text = comment_text
    db.session.commit()
