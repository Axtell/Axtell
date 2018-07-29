from app.server import server
from config import notifications

from flask import abort
from zipfile import ZipFile, ZIP_DEFLATED

"""
Apple Push Notification routes.

Because Apple likes to be special we have to make
seperate things to integrate with APN. Very important
to have caching enabled if doing APN because otherwise
this will be re-preparing the APN every time.
"""

@server.route("/static/apn/v2/pushPackages/<apn_id>")
def apn_get_push_package(apn_id):
    if notifications['apn_id'] == '' or notifications['apn_id'] is None:
        return abort(404)

    if notifications['apn_id'] != apn_id:
        return abort(404)

    # TODO
    return abort(404)
