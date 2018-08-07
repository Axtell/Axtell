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
from struct import pack
import requests

from config import notifications

WEBPUSH_PRIVATE_KEY_PATH = path.join(getcwd(), 'webpush-private.pem')
WEBPUSH_PUBLIC_KEY_PATH = path.join(getcwd(), 'webpush-public.pem')

WEBPUSH_EXPIRATION = timedelta(hours=12).total_seconds()

def get_public_key():
    with open(WEBPUSH_PUBLIC_KEY_PATH, 'rb') as key:
        return load_pem_public_key(key.read(), default_backend()).public_numbers().encode_point()

def create_webpush_jwt(endpoint):
    with open(WEBPUSH_PRIVATE_KEY_PATH, 'rb') as key:
        jwk = JWK.from_pem(key.read())

    endpoint_url = urlparse(endpoint)

    jwt = JWT(
        header={
            'typ': 'JWT',
            'alg': 'ES256'
        },
        claims={
            'sub': f'mailto:{notifications["support_email"]}',
            'exp': str(int(time() + WEBPUSH_EXPIRATION)),
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

    # const salt = crypto.randomBytes(16);
    salt = rand_bytes(16)

    # const localKeysCurve = crypto.createECDH('prime256v1');
    # localKeysCurve.generateKeys();
    # const localPrivateKey = localKeysCurve.getPrivateKey();
    local_private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())

    # const localPublicKey = localKeysCurve.getPublicKey();
    local_public_key = local_private_key.public_key()
    local_public_key_bytes = local_public_key.public_numbers().encode_point()

    # const sharedSecret = localKeysCurve.computeSecret(subscription.keys.p256dh, 'base64')
    shared_secret = local_private_key.exchange(
        ec.ECDH(),
        ec.EllipticCurvePublicNumbers.from_encoded_point(
            ec.SECP256R1(),
            client_pub_key
        ).public_key(default_backend())
    )

    print('shared secret:')
    print(shared_secret)

    # const authEncBuff = new Buffer('Content-Encoding: auth\0', 'utf8');
    # const prk = hkdf(subscription.keys.auth, sharedSecret, authEncBuff, 32);
    #                  salt                    ikm           info         length
    prk = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=auth,
        info=b'Content-Encoding: auth\0',
        backend=default_backend()
    ).derive(shared_secret)

    server_pub_key = get_public_key()

    # This is context which happens to be appended to end
    # of all the things
    context = b'P-256\0' + pack('!H', len(client_pub_key)) + client_pub_key +\
        pack('!H', len(local_public_key_bytes)) + local_public_key_bytes

    # This is something that cipher needs idk im not
    # crypto genius
    nonce = HKDF(
        algorithm=hashes.SHA256(),
        length=12,
        salt=salt,
        info=b'Content-Encoding: nonce\0' + context,
        backend=default_backend()
    ).derive(prk)

    print('nonce')
    print(urlsafe_b64encode(nonce))

    # CEK = Content Encryption Key
    # this goes into AES
    cek = HKDF(
        algorithm=hashes.SHA256(),
        length=16,
        salt=salt,
        info=b'Content-Encoding: aesgem\0' + context,
        backend=default_backend()
    ).derive(prk)

    print('cek')
    print(urlsafe_b64encode(cek))

    cipher = Cipher(algorithms.AES(cek), modes.GCM(nonce), default_backend())
    encryptor = cipher.encryptor()
    payload = pack('!H', 0) + message
    encrypted_payload = encryptor.update(payload) + encryptor.finalize() + encryptor.tag

    return encrypted_payload, local_public_key_bytes, salt

def send_notification(notification, endpoint, client_encoded_public_key, auth):
    # Get the auth JWT IDing server
    jwt = create_webpush_jwt(endpoint)

    payload = json_dumps(notification.to_push_json()).encode('utf8')

    server_public_key = get_public_key()
    client_public_key = urlsafe_b64decode(client_encoded_public_key)

    # Encrypt the payload
    encrypted_payload, local_public_key, salt = encrypt_payload(payload, client_public_key, auth)
    encoded_salt = urlsafe_b64encode(salt).decode('utf8')

    # Get pub key
    server_encoded_public_key = urlsafe_b64encode(server_public_key).decode('utf8')
    encoded_local_key = urlsafe_b64encode(local_public_key).decode('utf8')

    def pretty_print_POST(req):
        """
        At this point it is completely built and ready
        to be fired; it is "prepared".

        However pay attention at the formatting used in
        this function because it is programmed to be pretty
        printed and may differ from the actual request.
        """
        print('{}\n{}\n{}\n\n{}'.format(
            '-----------START-----------',
            req.method + ' ' + req.url,
            '\n'.join('{}: {}'.format(k, v) for k, v in req.headers.items()),
            req.body,
        ))


    req = requests.Request('POST', endpoint, data=encrypted_payload, headers={
        'Authorization': f"WebPush {jwt.strip('=')}",
        'Encryption': f"salt={encoded_salt}",
        'Content-Length': str(len(encrypted_payload)),
        'Content-Type': "application/octet-stream",
        'Content-Encoding': "aesgcm",
        'Crypto-Key': f"dh={encoded_local_key.strip('=')};p256ecdsa={server_encoded_public_key.strip('=')}",
        'TTL': str(int(WEBPUSH_EXPIRATION)),
        'Urgency': "normal"
    })
    p = req.prepare()
    pretty_print_POST(p)
    r = requests.Session().send(p)

    print(r.status_code)
    print(r.content)
