from app.server import server
from app.notifications.webpush import get_public_key
from app.session.csrf import csrf_protected
from app.controllers import webpush

from flask import request

@server.route("/webpush/key", methods=['GET'])
def get_webpush_pubkey():
    return get_public_key()

@server.route("/webpush/register", methods=['POST'])
@csrf_protected
def webpush_register_device():
    auth_json = request.get_json(silent=True)
    return webpush.add_webpush_device(auth_json)
