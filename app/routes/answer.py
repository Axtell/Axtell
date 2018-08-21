from flask import request, g, abort, jsonify, redirect, url_for
from base64 import b64decode

from app.controllers import answer
from app.server import server
from app.helpers.render import render_template, render_json
from app.session.csrf import csrf_protected


@server.route('/answer/public', methods=['POST'])
@csrf_protected
def publish_answer():
    if g.user is None:
        return abort(403)

    post_id = request.form['post_id']

    # Important parts
    code = b64decode(request.form['code'])
    lang_id = request.form.get('lang_id', None)
    lang_name = request.form.get('lang_name', None)
    encoding = request.form.get('encoding', 'utf8')

    # TODO: Perhaps validate commentary exists?
    commentary = request.form.get('commentary', "")

    return answer.create_answer(post_id, code, commentary, lang_id=lang_id, lang_name=lang_name, encoding=encoding)


@server.route('/answer/edit/<int:answer_id>', methods=['POST'])
def edit_answer(answer_id):
    try:
        return render_json(answer.revise_answer(answer_id, request.get_json()).to_json())
    except PermissionError:
        return abort(403)
