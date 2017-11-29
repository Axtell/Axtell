from app.helpers.render import render_template
from app.server import server


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
