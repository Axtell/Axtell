from app.server import server
from app.helpers.render import render_template, render_json
import app.tasks as tasks
from app.controllers import post
from flask import request, redirect, url_for, g, abort


@server.route("/posts")
def get_posts():
    try:
        page = int(request.args.get('p', 1))
    except ValueError:
        return abort(400)

    return render_template('posts.html', posts=post.get_posts(page=page))


@server.route("/post/<int:post_id>")
def get_post(post_id):
    matched_post = post.get_post(post_id=post_id)
    if matched_post is None:
        return abort(404)

    # TODO: async loading
    body = tasks.markdown.render_markdown.delay(matched_post.body).wait()
    if body is None:
        return abort(500)

    return render_template('post/view.html', post_title=matched_post.title, post_body=body)


@server.route("/post/write")
def write_post():
    if g.user is None:
        return redirect(url_for('home'))

    return render_template('post/write.html')


@server.route("/post/public", methods=['POST'])
def publish_post():
    if g.user is None: return abort(403)

    title = request.form['post-title']
    body = request.form['post-body']

    return post.create_post(
        title=title,
        body=body,
        tags=[]
    )
