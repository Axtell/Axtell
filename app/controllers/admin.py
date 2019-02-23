from flask import g, abort, redirect, url_for, render_template
from app.instances import db
from ast import literal_eval
from app.models.Post import Post
from app.models.Answer import Answer
from app.models.User import User
from app.models.PostVote import PostVote
from app.models.AnswerVote import AnswerVote
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


def merge_users(sources, target):
    Post.update().where(Post.user_id in sources).values(user_id=target).execute()
    Answer.update().where(Answer.user_id in sources).values(user_id=target).execute()
    db.session.commit()


def delete_user(user_id):
    if user_id == g.user.id:
        # do not allow users to nuke themselves
        raise ValueError

    # anonymize posts and answers
    Post.update().where(Post.user_id == user_id).values(deleted=True).execute()
    Answer.update().where(Answer.user_id == user_id).values(deleted=True).execute()

    # remove personal/preference data from user and set deleted flag
    User.update().where(User.id == user_id).values(name='user_{}'.format(user_id),
                                                   email='',
                                                   avatar=None,
                                                   theme=None,
                                                   is_admin=False,
                                                   deleted=True)

    # remove votes
    PostVote.delete().where(PostVote.user_id == user_id).execute()
    AnswerVote.delete().where(AnswerVote.user_id == user_id).execute()

    db.session.commit()


def reset_votes(user_id):
    PostVote.delete().where(PostVote.user_id == user_id).execute()
    AnswerVote.delete().where(AnswerVote.user_id == user_id).execute()

    db.session.commit()
