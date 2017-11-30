from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Post import Post
from config import posts


def create_post(title, body, tags):
    if g.user is None:
        return abort(403)

    # We don't really need to provide too much data since this is
    # validated client-side
    if not (posts['min_title'] <= len(title) <= posts['max_title']):
        return abort(400)
    if not (posts['min_len'] <= len(body) <= posts['max_len']):
        return abort(400)

    new_post = Post(title=title, body=body)
    g.user.posts.append(new_post)

    db.session.add(new_post)
    db.session.commit()

    return redirect(url_for('get_post', post_id=new_post.id))


def get_posts(page):
    page = Post.query.order_by(Post.date_created.desc()).paginate(page, per_page=posts['per_page'], error_out=False)
    return page


def get_post(post_id):
    post = Post.query.filter_by(id=post_id).first()
    if post is None:
        return None

    return post
