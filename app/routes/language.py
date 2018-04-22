from flask import  abort

from app.helpers.render import render_error, render_json, render_template
from app.server import server

from app.models.Answer import Answer
from app.models.Language import Language

@server.route("/languages")
def languages():
    return render_template('languages.html', languages=Language.getAll())

@server.route("/language/<lang_id>")
def language(lang_id):
    if not Language.exists(lang_id):
        return abort(404)

    normalized_id = Language.normalize(lang_id)
    newest_answers = Answer.query.filter_by(language_id=normalized_id).order_by(Answer.date_created.desc()).limit(5).all()

    return render_template('language.html', language=Language(lang_id), newest_answers=newest_answers)
