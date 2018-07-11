from app.helpers.render import render_template, render_json
from app.models.Language import Language
from app.server import server
from misc import path_for_icon, default_svg
from jinja2.exceptions import TemplateNotFound
from flask import Response, send_file, send_from_directory, abort
import golflang_encodings


@server.route("/")
def home():
    return render_template('index.html')


@server.route("/help")
def help():
    return render_template('help.html')


@server.route("/help/<path:path>")
def help_page(path):
    try:
        return render_template(f'help/{path}.html')
    except TemplateNotFound:
        return abort(404)


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


@server.route("/robots.txt")
def robots():
    return send_from_directory(server.static_folder, 'robots.txt')


@server.route("/favicon.ico")
def favicon():
    return send_from_directory(server.static_folder, 'favicon.ico')


@server.route("/static/encodings/<encoding>")
def get_encoding(encoding):
    encoding_data = golflang_encodings.add_encodings.codepages.get(encoding, None)
    print(encoding_data)
    return render_json({encoding: encoding_data})
