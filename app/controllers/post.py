from flask import g, abort, redirect, url_for

from app.instances.db import db
from app.models.Post import Post
from config import posts_per_page


def create_post(title, body, tags):
    if g.user is None:
        return abort(403)
    
    new_post = Post(title=title, body=body)
    g.user.posts.append(new_post)

    db.session.add(new_post)
    db.session.commit()
    
    return redirect(url_for('get_post', post_id=new_post.id))


def get_posts(page):
    page = Post.query.order_by(Post.date_created.desc()).paginate(page, per_page=posts_per_page, error_out=False)
    return page


def get_post(post_id):
    post = Post.query.filter_by(id=post_id).first()
    return post
