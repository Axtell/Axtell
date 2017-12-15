from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Answer import Answer
from app.models.Post import Post
from app.models.Language import Language
from config import posts


def create_answer(post_id, code, commentary, lang_id=None, lang_name=None):
    """
    Creates an answer on a given post. You may provide `lang_id` if you have a
    known language, or `lang_name` instead if you have a non-native language.
    Do NOT provide both.

     - `403` when not logged in
     - `400` when a bad `lang_id` is provided.
    """

    if g.user is None:
        return abort(403)

    # Ensure language exists
    if lang_id is not None and not Language.exists(lang_id):
        return abort(400)

    new_answer = Answer(post_id=post_id, language_name=lang_name, language_id=lang_id, code=code, commentary=commentary)
    g.user.answers.append(new_answer)
    post = Post.query.filter_by(id=post_id).first()
    post.answers.append(new_answer)

    db.session.add(new_answer)
    db.session.commit()

    return redirect(url_for('get_post', post_id=post_id, a=new_answer.id))


def get_leaderboard(post_id, limit=5):
    return Answer.query \
        .filter_by(post_id=post_id) \
        .order_by(Answer.byte_len.asc()) \
        .limit(limit) \
        .all()


def get_answers(post_id, page):
    page = Answer.query. \
        filter_by(post_id=post_id) \
        .order_by(Answer.date_created.desc()) \
        .paginate(page, per_page=posts['per_page'], error_out=False)
    return page


def get_answer(answer_id):
    answer = Answer.query.filter_by(id=answer_id).first()
    return answer
