from flask import request, redirect, url_for, g, abort

import app.tasks.markdown as markdown
from app.controllers import post, answer as answer_controller, vote
from app.helpers.render import render_template, render_json
from app.helpers.comments import get_rendered_comments
from app.helpers.macros.encode import slugify
from app.models.AnswerComment import AnswerComment
from app.models.PostComment import PostComment
from app.models.Leaderboard import Leaderboard
from app.server import server
from app.session.csrf import csrf_protected
from config import canonical_host

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


@server.route("/post/canonical_url/<int:post_id>")
def get_canonical_post_url(post_id):
    matched_post = post.get_post(post_id=post_id)
    if matched_post is None:
        return abort(404)
    url = canonical_host + url_for('get_post', post_id=post_id, title=slugify(matched_post.title))
    return render_json({"url": url})


@server.route("/post/preview/<id>")
def get_post_preview(id):
    # Make sure valid preview ID.
    # These numbers should be in-sync with JS
    if not match('[0-9a-f]{32}:[0-9a-f]{16}', id):
        return abort(404)

    return render_template('post/preview.html', id=id)


@server.route("/post/<int:post_id>", defaults={"title": None})
@server.route("/post/<int:post_id>/<title>")
def get_post(post_id, title=None):
    # Locate post
    matched_post = post.get_post(post_id=post_id)
    if matched_post is None:
        return abort(404)

    if matched_post.deleted:
        return render_template('deleted.html'), 410

    # Always redirect to canonical url
    slug = slugify(matched_post.title)

    # Redirect if slug is incorrect. add 'r=y' flag to avoid infinite redirection in
    # exceptional circumstances
    if title != slug and request.args.get('r', 'n') != 'y':
        return redirect(url_for('get_post', post_id=post_id, title=slug, **request.args, r='y'), code=301)

    # Render main post's markdown
    body = markdown.render_markdown.delay(matched_post.body).wait()

    if body is None:
        return abort(500)

    # Get answers
    try:
        page = int(request.args.get('p', 1))
    except ValueError:
        return abort(400)

    answers = answer_controller.get_answers(post_id=post_id, page=page)
    leaderboard = Leaderboard(post_id=post_id)

    # Get respective comments
    answer_comments = []
    for answer in answers.items:
        answer_comments.append(get_rendered_comments(AnswerComment, max_depth=2, answer_id=answer.id))

    post_comments = get_rendered_comments(PostComment, max_depth=2, post_id=post_id)

    return \
        render_template('post/view.html', post_id=post_id, post=matched_post,
                        post_body=body, answers=answers, leaderboard=leaderboard,
                        vote=vote, answer_comments=answer_comments, post_comments=post_comments)


@server.route("/post/write")
def write_post():
    if g.user is None:
        return redirect(url_for('home'))

    return render_template('post/write.html')


@server.route("/post/public", methods=['POST'])
@csrf_protected
def publish_post():
    if g.user is None:
        return abort(403)

    title = request.form.get('post-title', '').encode('utf-8')
    body = request.form.get('post-body', '').encode('utf-8')
    categories = request.form.getlist('post-categories')

    ppcg_id = request.form.get('post-ppcg-id', None, type=int)

    redirect_url = post.create_post(
        title=title,
        body=body,
        categories=categories,
        ppcg_id=ppcg_id
    )

    # only should accept JSON
    if request.headers.get('Accept', '') == 'application/json':
        return render_json({'redirect': redirect_url})
    else:
        return redirect(redirect_url)


@server.route("/post/<int:post_id>/edit", methods=['POST'])
@csrf_protected
def edit_post(post_id):
    try:
        return render_json(post.revise_post(post_id, request.get_json()).to_json())
    except PermissionError:
        return abort(403)
