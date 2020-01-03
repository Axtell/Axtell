from flask import url_for
from os import path, getcwd
from io import BytesIO
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha512
from json import dumps as json_dumps
from config import notifications, canonical_host
from urllib.parse import unquote
from uuid import UUID
from OpenSSL.crypto import load_pkcs12, _bio_to_string, _new_mem_buf
from OpenSSL._util import ffi, lib

from app.models.APNDevice import APNDevice, APNProvider
from app.server import server

WEBAPN_CERT_NAME = "webapn.p12"
WEBAPN_CERT_PASSWORD_NAME = "webapn.password"

WEBAPN_PUSHPACKAGE_TEMPLATE = 'Axtell.pushpackage';
WEBAPN_PAYLOADS = [
    "icon.iconset/icon_16x16.png",
    "icon.iconset/icon_16x16@2x.png",
    "icon.iconset/icon_32x32.png",
    "icon.iconset/icon_32x32@2x.png",
    "icon.iconset/icon_128x128.png",
    "icon.iconset/icon_128x128@2x.png"
]

def supports_web_apn(web_apn_id):
    if notifications['web_apn_id'] == '' or notifications['web_apn_id'] is None:
        return False
    elif notifications['web_apn_id'] != web_apn_id:
        return False
    else:
        return True


def create_signature(manifest):
    """
    Creates a signature of the manifest signed with the PKCS#12.
    Warning to future contributors: this uses internal bindings
    of pyOpenSSL so I know this function isn't pretty but it's
    as good as it'll get.
    """

    certificate_path = path.join(getcwd(), WEBAPN_CERT_NAME)
    certificate_password_path = path.join(getcwd(), WEBAPN_CERT_PASSWORD_NAME)

    with open(certificate_password_path, 'r') as password_file:
        passphrase = password_file.read().strip()

    with open(certificate_path, 'rb') as cert_file:
        cert_data = cert_file.read()

    p12 = load_pkcs12(cert_data, passphrase)
    cert = p12.get_certificate()
    pkey = p12.get_privatekey()

    # TODO: when pyOpenSSL responds to my issue and we get a BIO_flush method then
    # we'll use that to directly to BIO instead of copying here and there
    input_bio = _new_mem_buf(manifest.encode('utf-8'))
    output_bio = _new_mem_buf()

    # This is now our signature
    pkcs7 = lib.PKCS7_sign(cert._x509, pkey._pkey, ffi.NULL, input_bio, lib.PKCS7_BINARY | lib.PKCS7_DETACHED)

    # i2d converts the internal OpenSSL type (AIS.1/i) to DER/d
    lib.i2d_PKCS7_bio(output_bio, pkcs7)

    return _bio_to_string(output_bio)


def create_website_json(device):
    responder_url = url_for('notification_responder', notification_id='%@', name='%@', target_id='%@')

    return json_dumps({
        "websiteName": "Axtell",
        "websitePushID": notifications['web_apn_id'],
        "allowedDomains": [canonical_host],
        "urlFormatString": canonical_host + unquote(responder_url),
        "authenticationToken": device.uuid,
        # We can't use url_for beacuse the base URL shouldn't be a route
        "webServiceURL": canonical_host + "/webapn"
    })


def create_manifest(zf):
    hashes = {}

    for payload_name in zf.namelist():
        payload_item_hash = sha512()

        # from https://stackoverflow.com/a/44873382/1620622
        with zf.open(payload_name, mode='r') as payload_file:
            while True:
                # iterate in 4kb chunks
                block = payload_file.read(1024*4)
                if not block:
                    break

                payload_item_hash.update(block)

        hashes[payload_name] = {"hashType": "sha512", "hashValue": payload_item_hash.hexdigest()}

    return json_dumps(hashes)


def create_pushpackage_zip(device):
    """
    Creates a pushpackage zip for a user.
    """
    zip_file = BytesIO()

    with ZipFile(zip_file, 'w', ZIP_DEFLATED) as zf:
        for file in WEBAPN_PAYLOADS:
            zf.write(path.join(server.static_folder, WEBAPN_PUSHPACKAGE_TEMPLATE, file), arcname=file)

        website_json = create_website_json(device=device)
        zf.writestr("website.json", website_json)

        manifest = create_manifest(zf)
        zf.writestr("manifest.json", manifest)

        signature = create_signature(manifest)
        zf.writestr("signature", signature)

    zip_file.seek(0)
    return zip_file
