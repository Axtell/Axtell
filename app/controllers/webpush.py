from app.models.PushDevice import PushDevice
from app.helpers.render import render_json
from app.models.User import User
from app.instances.db import db
from cryptography.hazmat.primitives.asymmetric import ec

from urllib.parse import urlparse
from config import notifications
from base64 import urlsafe_b64decode
from flask import g, abort

def add_webpush_device(subscription_json):
    if not isinstance(g.user, User):
        return abort(401)

    if 'endpoint' not in subscription_json or\
        'keys' not in subscription_json or\
        'auth' not in subscription_json['keys'] or\
        'p256dh' not in subscription_json['keys']:
        return abort(400)

    if len(g.user.push_devices) > notifications['max_push_devices']:
        return abort(429)

    endpoint = subscription_json['endpoint']
    auth = subscription_json['keys']['auth']
    client_public_key = subscription_json['keys']['p256dh']

    # Add missing base64 padding
    auth += '=' * (-len(auth) % 4)
    client_public_key += '=' * (-len(client_public_key) % 4)

    # This is the expected length of encoded pub key
    if len(client_public_key) != 88:
        abort(400)

    # For why 24 see models.PushDevice
    # This is the expected length of the auth key
    if len(auth) != 24:
        return abort(400)

    # Validate public key
    try:
        public_key = ec.EllipticCurvePublicNumbers.from_encoded_point(
            ec.SECP256R1(),
            urlsafe_b64decode(client_public_key)
        )
    except:
        return abort(400)

    # Validate endpoint
    try:
        url = urlparse(endpoint)

        if url.scheme != 'https':
            return abort(400)
    except:
        return abort(400)

    push_device = PushDevice(user_id=g.user.id, endpoint=endpoint, auth=auth, client_pub=client_public_key)

    db.session.add(push_device)
    db.session.commit()

    return render_json({'device_id': push_device.id})


def remove_webpush_device(device_id):
    if not isinstance(g.user, User):
        return abort(401)

    PushDevice.query.\
        filter_by(id=device_id, user_id=g.user.id).\
        delete()

    db.session.commit()

    return render_json({'device_id': device_id})
