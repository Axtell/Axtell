from app.server import server
from flask import render_template

@server.route("/")
def home():
    return render_template('index.html')
