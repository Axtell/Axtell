from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Answer import Answer
from app.models.Notification import Notification, NotificationType
from app.helpers.answers import get_outgolfed_users
from app.notifications import send_notification
from app.models.Post import Post
from app.models.Language import Language
from config import posts


def create_answer(post_id, code, commentary, lang_id=None, lang_name=None, encoding='utf8'):
    """
    Creates an answer on a given post. You may provide `lang_id` if you have a
    known language, or `lang_name` instead if you have a non-native language.
    Do NOT provide both. This will emit a notification too

     - `401` when not logged in
     - `400` when a bad `lang_id` is provided.
    """

    if g.user is None:
        return abort(401)

    # Ensure language exists
    if lang_id is not None and not Language.exists(lang_id):
        return abort(400)

    new_answer = Answer(post_id=post_id, language_name=lang_name, language_id=lang_id, code=code, commentary=commentary,
                        encoding=encoding)
    g.user.answers.append(new_answer)
    post = Post.query.filter_by(id=post_id).first()
    post.answers.append(new_answer)

    db.session.add(new_answer)
    db.session.commit()

    # Dispatch notification to post owner. Only dispatch if the post
    # user isn't the same as the answer owner.
    if post.user_id != new_answer.user_id:
        send_notification(Notification(
            recipient=post.user,
            notification_type=NotificationType.NEW_ANSWER,
            target_id=new_answer.id
        ))

    # Dispatch notifications to outgolfed users
    # TODO: perhaps make this into one query somehow rather than two
    outgolfed_users = get_outgolfed_users(new_answer)

    for outgolfed_user in outgolfed_users:
        send_notification(Notification(
            recipient=outgolfed_user,
            notification_type=NotificationType.OUTGOLFED,
            target_id=new_answer.id
        ))

    return redirect(url_for('get_post', post_id=post_id, answer_id=new_answer.id) + f"#answer-{new_answer.id}")


def get_answers(post_id, page):
    page = Answer.query. \
        filter_by(post_id=post_id, deleted=False) \
        .order_by(Answer.score.desc(), Answer.date_created.desc()) \
        .paginate(page, per_page=posts['per_page'], error_out=False)
    return page


def get_answer(answer_id):
    answer = Answer.query.filter_by(id=answer_id).first()
    return answer


def revise_answer(answer_id, data):
    answer = get_answer(answer_id)
    if answer.user_id != g.user.id:
        raise PermissionError
    answer, revision = answer.revise(g.user, **data)
    db.session.add(revision)
    db.session.commit()
    return answer
