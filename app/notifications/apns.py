"""
Communicates with APNS.
"""
from app.server import server

from hyper import HTTPConnection
from config import notifications
from jwcrypto.jwt import JWT
from jwcrypto.jwk import JWK
from datetime import timedelta
from time import time
from os import path, getcwd
from json import dumps as json_dumps, loads as json_loads

import bugsnag

apns_key = 'apns.p8'
apns_expiration = timedelta(days=1).total_seconds()

if server.debug and not notifications.get('web_apn_id', '').startswith('web.'):
    apns_server = 'api.development.push.apple.com:443'
else:
    apns_server = 'api.push.apple.com:443'

def create_apns_jwt():
    with open(path.join(getcwd(), apns_key), 'rb') as key:
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
    print(authorization_jwt)
    notification_json = json_dumps(notification.to_apns_json())

    headers = {
        'authorization': f'bearer {authorization_jwt}',
        'apns-expiration': str(int(time() + apns_expiration)),
        'apns-priority': '5',
        'apns-topic': notifications['web_apn_id']
    }

    url = f'/3/device/{device.device_id}'

    conn = HTTPConnection(apns_server)
    conn.request('POST', url, body=notification_json, headers=headers)

    server.logger.info(f'Notification (APNS) dispatched {notification.id} -> {device.device_id}')

    resp = conn.get_response()
    response_status = resp.status
    response_body = resp.read()

    # Handle errors in APNS notifications. Apple explicitly states
    # that response will be exactly 200 is successful, any other
    # response indicates otherwise
    if response_status != 200:
        try:
            reason = json_loads(response_body)['reason']
        except ValueError:
            reason = "unknown"

        if bugsnag.configuration.api_key is not None:
            bugsnag.notify(
                Exception("APNS dispatch error"),
                meta_data={"apns_rejection": {"reason": reason}}
            )

        server.logger.error(f'Notification (APNS) rejected {notification.id} -> {device.device_id}:\n{reason}')
