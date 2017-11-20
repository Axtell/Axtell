import app.server
import app.helpers.render
import app.routes.static


@app.server.server.route("/")
def home():
    return app.helpers.render.render_template('index.html')


@app.server.server.errorhandler(404)
def error_404(e):
    return app.helpers.render.render_template('notfound.html'), 404


@app.server.server.errorhandler(500)
def error_500(e):
    return app.helpers.render.render_template('servererror.html'), 500
