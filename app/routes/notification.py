from app.server import server

from flask import abort

@server.route('/responder/<notification_id>/<name>/<target_id>')
def notification_responder(notification_id, name, target_id):
    return abort(400)
