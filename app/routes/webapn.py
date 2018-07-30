from app.server import server
from app.notifications.webapn import create_website_json, create_signature, create_manifest, create_pushpackage_zip, pushpackage_zip_name, supports_web_apn
from app.controllers import push_notifications
from app.session.csrf import csrf_protected
from config import notifications

from flask import abort, request, session
from json import dumps as json_dumps

import bugsnag

webapn_redis_id_prefix = 'webapn:'
webapn_redis_id_time = 60 * 2 # In seconds

"""
Safari Push Notification routes.

Because Apple likes to be special we have to make
seperate things to integrate with Web APN. Very important
to have caching enabled if doing APN because otherwise
this will be re-preparing the APN every time.
"""

@server.route("/webapn/responder/<name>/<id>")
def webapn_responder(name, id):
    return abort(404)

@server.route("/webapn/get_identification", methods=['POST'])
@csrf_protected
def webapn_get_identification():
    if not instanceof(g.user, User):
        return abort(401)

    authorization_token = push_notifications.generate_temporary_id()

    return render_json({'token': authorization_token})

@server.route("/static/webapn/v<int:version>/pushPackages/<web_apn_id>", methods=['POST'])
def webapn_get_push_package(version, web_apn_id):
    if not supports_web_apn(web_apn_id) or not push_notifications.is_valid_webapn_version(version):
        return abort(404)

    # Validate CSRF
    json = request.get_json(silent=True)
    authorization_token = json['token']
    user = get_temporary_id_user(authorization_token)

    return send_from_directory(server.static_folder, pushpackage_zip_name)

@server.route("/static/webapn/v<int:version>/devices/<device_token>/registrations/<web_apn_id>", methods=['POST'])
def webapn_add_registration(version, device_token, web_apn_id):
    if not supports_web_apn(web_apn_id) or not push_notifications.is_valid_webapn_version(version):
        return abort(404)

    print(g.user)
    return abort(200)

@server.route("/static/webapn/v<int:version>/log", methods=['POST'])
def webapn_log(version):
    if not push_notifications.is_valid_webapn_version(version):
        return abort(404)

    logs = request.get_json(silent=True)["logs"]

    if server.debug:
        print(json_dumps(logs))

    if bugsnag.configuration.api_key is not None:
        bugsnag.notify(
            Exception("WebAPN exception"),
            meta_data={"webapn_logs": {f"Log {i}": log for i, log in enumerate(logs)}}
        )

    return ('', 204)
