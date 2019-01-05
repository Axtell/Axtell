from flask import g, abort, redirect, url_for, render_template
from app.instances import db
from ast import literal_eval
from app.models.Post import Post
from app.models.Answer import Answer
from app.instances import db

def get_duplicate_users():
    # SQLAlchemy doesn't have native support for MySQL views,
    # so we use raw SQL here - need to find a better method eventually
    result = db.engine.execute('SELECT * FROM duplicate_users')
    data = []
    for row in result:
        user_ids = literal_eval(row[1])
        user_names = literal_eval(row[2])
        users = map(
            lambda user: {'id': str(user[0]), 'name': user[1]},
            zip(user_ids, user_names)
        )
        data.append({'ip': row[0], 'users': users})
    return data


def delete_post(id):
    post = Post.query.filter_by(id=id).first()
    if post:
        db.session.delete(post)
        db.session.commit()
        return True
    return False


def delete_answer(id):
    answer = Answer.query.filter_by(id=id).first()
    if answer:
        post_id = answer.post_id
        db.session.delete(answer)
        db.session.commit()
        return post_id
    return False