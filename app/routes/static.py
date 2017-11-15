from app.server import server
from app.helpers.render import render_template


@server.route("/")
def home():
    return render_template('index.html')
