from flask import request, g, abort

from app.controllers import answer
from app.server import server

@server.route('/answer/public', methods=['POST'])
def publish_answer():
    if g.user is None:
        return abort(403)

    post_id = request.form['post_id']
    code = request.form['code']
    lang_id = request.form.get('lang_id', None)
    lang_name = request.form.get('lang_name', None)
    commentary = request.form['commentary']

    return answer.create_answer(post_id, code, commentary, lang_id=lang_id, lang_name=lang_name)
