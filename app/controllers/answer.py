from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Answer import Answer
from app.models.Post import Post
from config import posts


def create_answer(post_id, code, commentary):
    if g.user is None:
        return abort(403)

    new_answer = Answer(post_id=post_id, code=code, commentary=commentary)
    g.user.answers.append(new_answer)
    Post.query.filter_by(id=post_id).first().answers.append(new_answer)

    db.session.add(new_answer)
    db.commit()

    return redirect(url_for('get_answer', post_id=new_answer.id))


def get_answers(post, page):
    page = Answer.query. \
        filter_by(post_id=post) \
        .order_by(Answer.date_created.desc()) \
        .paginate(page, per_page=posts['per_page'], error_out=False)
    return page


def get_answer(answer_id):
    answer = Answer.query.filter_by(id=answer_id).first()
    return answer
