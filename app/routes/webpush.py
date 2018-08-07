from app.server import server
from app.notifications.webpush import get_public_key
from app.session.csrf import csrf_protected
from app.controllers import webpush

from flask import request

@server.route("/static/webpush/key", methods=['GET'])
def get_webpush_pubkey():
    return get_public_key()

@server.route("/webpush/register", methods=['POST'])
@csrf_protected
def webpush_register_device():
    auth_json = request.get_json(silent=True)
    return webpush.add_webpush_device(auth_json)

@server.route("/webpush/device/<int:device_id>", methods=['DELETE'])
@csrf_protected
def webpush_remove_device(device_id):
    return webpush.remove_webpush_device(device_id)
