from flask import request, redirect, url_for, g, abort

import app.tasks.markdown as markdown
from app.controllers import post, answer, vote
from app.helpers.render import render_template, render_json
from app.models.Leaderboard import Leaderboard
from app.server import server

from re import match


@server.route("/posts")
def get_posts():
    try:
        page = int(request.args.get('p', 1))
    except ValueError:
        return abort(400)

    posts = post.get_posts(page=page)

    if len(posts.items) == 0:
        return abort(404)

    return render_template('posts.html', posts=posts)


@server.route("/post/preview/<id>")
def get_post_preview(id):
    # Make sure valid preview ID.
    # These numbers should be in-sync with JS
    if not match('[0-9a-f]{32}:[0-9a-f]{16}', id):
        return abort(404)

    return render_template('post/preview.html', id=id)


@server.route("/post/<int:post_id>")
def get_post(post_id):
    # Locate post
    matched_post = post.get_post(post_id=post_id)
    if matched_post is None:
        return abort(404)

    # Render main post's markdown
    body = markdown.render_markdown.delay(matched_post.body).wait()

    if body is None:
        return abort(500)

    # Get answers
    try:
        page = int(request.args.get('p', 1))
    except ValueError:
        return abort(400)

    answers = answer.get_answers(post_id=post_id, page=page)
    leaderboard = Leaderboard(post_id=post_id)

    return \
        render_template('post/view.html', post_id=post_id, post=matched_post,
                        post_body=body, answers=answers, leaderboard=leaderboard,
                        vote=vote)


@server.route("/post/write")
def write_post():
    if g.user is None:
        return redirect(url_for('home'))

    return render_template('post/write.html')


@server.route("/post/public", methods=['POST'])
def publish_post():
    if g.user is None:
        return abort(403)

    title = request.form.get('post-title', '').encode('utf-8')
    body = request.form.get('post-body', '').encode('utf-8')
    categories = request.form.getlist('post-categories')

    return post.create_post(
        title=title,
        body=body,
        categories=categories
    )
