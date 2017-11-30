from app.helpers.render import render_template
from app.models.Language import Language
from app.server import server
from misc import path_for_icon, default_svg
from flask import Response, send_file
from pathlib import Path


@server.route("/")
def home():
    return render_template('index.html')


@server.route("/lang/logo/<lang_id>.svg")
def lang_logo(lang_id):
    if not Language.exists(lang_id):
        return Response("<svg></svg>", mimetype='image/svg+xml'), 404

    language = Language(lang_id)

    # Try to locate file itself
    try:
        with open(path_for_icon(language.get_id())) as img_file:
            response = Response(img_file.read(), mimetype='image/svg+xml')
    except:
        color = language.get_color()
        lang_id = language.get_short_id()
        response = Response(default_svg(name=lang_id, color=color), mimetype='image/svg+xml')

    response.cache_control.max_age = 600
    return response

@server.errorhandler(404)
def error_404(e):
    return render_template('notfound.html'), 404


@server.errorhandler(500)
def error_500(e):
    return render_template('servererror.html'), 500

@server.errorhandler(400)
def error_400(e):
    return render_template('badrequest.html'), 400
