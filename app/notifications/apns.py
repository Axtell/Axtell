from app.server import server

from hyper import HTTPConnection
from config import notifications
from jwcrypto.jwt import JWT
from jwcrypto.jwk import JWK
from datetime import timedelta
from time import time
from os import path, getcwd
from json import dumps as json_dumps

"""
Communicates with APNS.
"""

apns_key = 'apns.p8'
apns_expiration = timedelta(days=1).total_seconds()

if server.debug:
    apns_server = 'api.push.apple.com:443'
else:
    apns_server = 'api.push.apple.com:443'

def create_apns_jwt():
    with open(path.join(getcwd(), apns_key), 'rb') as key:
        jwk = JWK.from_pem(key.read())

    jwt = JWT(
        header={
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
    print(url)
    conn = HTTPConnection(apns_server)
    conn.request('POST', url, body=notification_json, headers=headers)
    response = conn.get_response().read()
    print(response)

