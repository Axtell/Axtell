"""
This file implements the Web Push API
"""

from jwcrypto.jwt import JWT
from jwcrypto.jwk import JWK
from M2Crypto.m2 import rand_bytes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

from base64 import urlsafe_b64encode, urlsafe_b64decode
from json import dumps as json_dumps
from urllib.parse import urlparse
from datetime import timedelta
from os import path, getcwd
from time import time
import requests

from config import notifications

webpush_private_key_path = path.join(getcwd(), 'webpush-private.pem')
webpush_public_key_path = path.join(getcwd(), 'webpush-public.pem')

webpush_expiration = timedelta(days=1).total_seconds()

def get_public_key():
    with read(webpush_public_key_path, 'rb') as key:
        return load_pem_public_key(key.read(), default_backend()).public_numbers().encode_point()

def create_webpush_jwt(endpoint):
    with open(webpush_private_key_path, 'rb') as key:
        jwk = JWK.from_pem(key.read())

    endpoint_url = urlparse(endpoint)

    jwt = JWT(
        header={
            'typ': 'JWT',
            'alg': 'ES256'
        },
        claims={
            'sub': f'mailto:{notifications["support_email"]}',
            'exp': str(int(time() + webpush_expiration)),
            'aud': f'{endpoint_url.scheme}://{endpoint_url.netloc}'
        },
        algs=['ES256']
    )

    jwt.make_signed_token(jwk)
    return jwt.serialize()

def encrypt_payload(message, client_pub_key, auth):
    """
    This is quite a bit but for more information I wrote
    a blog post https://blog.vihan.org/the-push-protocol/

    Brief overview is we take our private and client public key
    which are ECC keys on the P-256 NIST curve and we perform a
    diffie-hellman (ECDH) key exchange to obtain a shared
    secret to generate a HKDF key which is derived with various
    content types to obtain the encryption parameters for an
    AES-128-GCM cipher.

    :param bytes message: Binary message
    :param bytes client_pub_key:
    :param bytes auth:
    """
    salt = rand_bytes(16)

    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    shared_secret = private_key.exchange(
        ec.ECDH(),
        ec.EllipticCurvePublicNumbers.from_encoded_point(
            ec.SECP256R1(),
            client_pub_key
        ).public_key(default_backend())
    )

    prk = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=auth,
        info=b'Content-Encoding: auth\0',
        backend=default_backend()
    ).derive(shared_secret)

    server_pub_key = get_public_key()

    context = b'P-256\0' + pack('!H', len(client_pub_key)) + client_pub_key +
        pack('!H', len(server_pub_key)) + server_pub_key

    nonce = HKDF(
        algorithm=hashes.SHA256(),
        length=12,
        salt=salt,
        info=b'Content-Encoding: nonce\0' + context,
        backend=default_backend()
    ).derive(prk)

    cek = HKDF(
        algorithm=hashes.SHA256(),
        length=16,
        salt=salt,
        info=b'Content-Encoding: aesgem\0' + context,
        backend=default_backend()
    ).derive(prk)

    cipher = Cipher(algorithms.AES(cek), modes.GCM(nonce), default_backend())
    encryptor = cipher.encryptor()
    encrypted_payload = encryptor.update(message) + encryptor.finalize() + encryptor.tag

    return encrypted_payload, salt

def send_notification(notification, endpoint, client_encoded_public_key, auth):
    # Get the auth JWT IDing server
    jwt = create_webpush_jwt(endpoint)

    payload = json_dumps(notification.to_push_json()).encode('utf8')

    server_public_key = get_public_key()
    client_public_key = urlsafe_b64decode(client_encoded_public_key)

    # Encrypt the payload
    encrypted_payload, salt = encrypt_payload(payload, client_public_key, auth)

    # Get pub key
    server_encoded_public_key = urlsafe_b64encode(server_public_key)

    requests.post(endpoint, data=encrypted_payload, headers={
        'Authorization': f'WebPush {jwt}',
        'Encryption': f'salt={salt}',
        'Content-Length': len(encrypted_payload),
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aesgcm',
        'Crypto-Key': f'dh={client_encoded_public_key}; p256edsa={server_encoded_public_key}',
    })
