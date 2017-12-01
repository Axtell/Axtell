from app.helpers.render import render_template
from app.server import server
from flask import send_from_directory


@server.route("/")
def home():
    return render_template('index.html')


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
