from flask import g, abort, url_for
from sqlalchemy import func

from app.instances import db
from app.models.Post import Post
from app.models.Answer import Answer
from app.models.Category import Category
from app.helpers.macros.encode import slugify
from config import posts


def create_post(title, body, categories, ppcg_id=None):
    if g.user is None:
        return abort(403)

    # We don't really need to provide too much data since this is
    # validated client-side
    if not posts['min_title'] <= len(title) <= posts['max_title']:
        return abort(400)
    if not posts['min_len'] <= len(body) <= posts['max_len']:
        return abort(400)
    if not len(categories) < posts['max_tags']:
        return abort(400)

    for category in categories:
        if not Category.query.filter_by(name=category).first():
            # Category doesn't exist so error
            return abort(400)

    # TODO: insert categories when models support
    new_post = Post(title=title, body=body, ppcg_id=ppcg_id)
    g.user.posts.append(new_post)

    db.session.add(new_post)
    db.session.commit()

    return url_for('get_post', post_id=new_post.id, title=slugify(new_post.title))


def get_posts(page):
    page = db.session.query(Post, func.count(Answer.id)) \
        .outerjoin(Answer, Post.id == Answer.post_id) \
        .group_by(Post.id) \
        .filter_by(deleted=False) \
        .order_by(Post.date_created.desc()) \
        .paginate(page, per_page=posts['per_page'], error_out=False)

    return page


def get_post(post_id):
    post = Post.query.filter_by(id=post_id).first()
    return post


def revise_post(post_id, data):
    post = get_post(post_id)
    if post.user_id != g.user.id:
        raise PermissionError
    post, revision = post.revise(g.user, **data)
    db.session.add(revision)
    db.session.commit()
    return post
