from app.server import server
from app.helpers.render import render_template


@server.route("/")
def home():
    return render_template('index.html')

@server.errorhandler(404)
def error_404(e):
    return render_template('notfound.html'), 404
