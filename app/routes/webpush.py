from app.server import server
from app.notifications.webpush import get_public_key
from flask import send_file

@server.route("/static/webpush/key", methods=['GET'])
def get_webpush_pubkey():
    return get_public_key()
