"""
This file implements the Web Push API
"""

from jwcrypto.jwt import JWT
from jwcrypto.jwk import JWK
from datetime import timedelta
from time import time
from os import path, getcwd
from M2Crypto import EC

from config import notifications

webpush_private_key = path.join(getcwd(), 'webpush-private.pem')
webpush_public_key = path.join(getcwd(), 'webpush-public.pem')

webpush_expiration = timedelta(days=1).total_seconds()

def get_public_key():
    return EC.load_pub_key(webpush_public_key).get_key()

def create_webpush_jwt():
    with open(webpush_private_key, 'rb') as key:
        jwk = JWK.from_pem(key.read())

    jwt = JWT(
        header={
            'typ': 'JWT',
            'alg': 'ES256'
        },
        claims={
            'sub': f'mailto:{notifications["support_email"]}',
            'exp': str(int(time() + webpush_expiration)),

        },
        algs=['ES256']
    )

    jwt.make_signed_token(jwk)
    return jwt.serialize()
