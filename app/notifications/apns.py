"""
Communicates with APNS.
"""
from app.server import server
from app.instances import db

from hyper import HTTPConnection
from config import notifications
from jwcrypto.jwt import JWT
from jwcrypto.jwk import JWK
from datetime import timedelta
from time import time
from os import path, getcwd
from json import dumps as json_dumps, loads as json_loads

import bugsnag

APNS_KEY = 'apns.p8'
APNS_EXPIRATION = timedelta(days=1).total_seconds()

if server.debug and not notifications.get('web_apn_id', '').startswith('web.'):
    APNS_SERVER = 'api.development.push.apple.com:443'
else:
    APNS_SERVER = 'api.push.apple.com:443'


def create_apns_jwt():
    with open(path.join(getcwd(), APNS_KEY), 'rb') as key:
        jwk = JWK.from_pem(key.read())

    jwt = JWT(
        header={
            'typ': 'JWT',
            'alg': 'ES256',
            'kid': notifications['apns_key_id']
        },
        claims={
            'iss': notifications['apple_team_id'],
            'iat': int(time())
        },
        algs=['ES256']
    )

    jwt.make_signed_token(jwk)
    return jwt.serialize()


def send_notification(device, notification):
    if not notifications['apns_key_id']:
        return ""

    authorization_jwt = create_apns_jwt()
    notification_json = json_dumps(notification.to_apns_json())

    headers = {
        'authorization': f'bearer {authorization_jwt}',
        'apns-expiration': str(int(time() + APNS_EXPIRATION)),
        'apns-priority': '5',
        'apns-topic': notifications['web_apn_id']
    }

    url = f'/3/device/{device.device_id}'

    conn = HTTPConnection(APNS_SERVER)
    conn.request('POST', url, body=notification_json, headers=headers)

    server.logger.info(f'Notification (APNS) dispatched {notification.uuid} -> {device.device_id}')

    resp = conn.get_response()
    response_status = resp.status
    response_body = resp.read()

    # Handle errors in APNS notifications. Apple explicitly states
    # that response will be exactly 200 is successful, any other
    # response indicates otherwise
    if response_status != 200:
        try:
            reason = json_loads(response_body)['reason']

            # If reason is 'BadDeviceToken' this means the user has likely
            # unsubscribed so we'll remove their device subscription
            if reason == 'BadDeviceToken':
                db.session.delete(device)
                db.session.commit()

        except ValueError:
            reason = "unknown"

        if bugsnag.configuration.api_key is not None:
            bugsnag.notify(
                Exception("APNS dispatch error"),
                meta_data={"apns_rejection": {"reason": reason}}
            )

        server.logger.error(f'Notification (APNS) rejected {notification.uuid} -> {device.device_id}:\n{reason}')
