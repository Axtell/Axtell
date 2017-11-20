from flask import request, redirect, url_for, g, abort

import app.tasks as tasks
from app.controllers import answer
from app.helpers.render import render_template
from app.server import server


@server.route('/post/<int:post_id>/answers')
def get_answers(post_id):
    try:
        page = int(request.args.get('p', 1))
    except ValueError:
        return abort(400)

    return render_template('answers.html', answers=answer.get_answers(post=post_id, page=page))


@server.route('/post/<int:post_id>/answer/<int:answer_id>')
def get_answer(post_id, answer_id):
    matched_answer = answer.get_answer(answer_id)
    if matched_answer is None:
        return abort(404)

    body = tasks.markdown.render_markdown.delay(matched_answer.body).wait()

    if body is None:
        return abort(500)

    return render_template('answer/view.html', answer_body=body)


@server.route('/post/<int:post_id>/answer')
def write_answer(post_id):
    if g.user is None:
        return redirect(url_for('home'))

    return render_template('answer/write.html')


@server.route('/answer/public', methods=['POST'])
def publish_answer():
    if g.user is None:
        return abort(403)

    post_id = request.form['post_id']
    code = request.form['code']
    commentary = request.form['commentary']

    return answer.create_answer(post_id, code, commentary)
