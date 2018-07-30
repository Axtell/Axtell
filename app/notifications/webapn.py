from flask import url_for
from os import path, getcwd
from zipfile import ZipFile, ZIP_DEFLATED
from hashlib import sha512
from json import dumps as json_dumps
from config import notifications, canonical_host
from urllib.parse import unquote
from uuid import UUID
from OpenSSL.crypto import load_pkcs12, _bio_to_string
from OpenSSL._util import path_string, ffi, lib
from M2Crypto.m2 import rand_bytes
from M2Crypto.SMIME import PKCS7_BINARY, PKCS7_DETACHED

from app.server import server

pushpackage_name = "Axtell.pushpackage"
pushpackage_zip_name = "Axtell.pushpackage.zip"

webapn_cert_name = "webapn.p12"
webapn_cert_password_name = "webapn.password"
webapn_authentication_token = str(UUID(bytes=rand_bytes(16)))

def get_pushpackage_path():
    return path.join(server.static_folder, pushpackage_name)

def get_pushpackage_zip_path():
    return path.join(server.static_folder, f"{pushpackage_name}.zip")

pushpackage_manifest = "manifest.json"
pushpackage_signature = "signature"
pushpackage_website_json = "website.json"

webapn_payloads = [
    "icon.iconset/icon_16x16.png",
    "icon.iconset/icon_16x16@2.png",
    "icon.iconset/icon_32x32.png",
    "icon.iconset/icon_32x32@2.png",
    "icon.iconset/icon_128x128.png",
    "icon.iconset/icon_128x128@2.png",
    pushpackage_manifest,
    pushpackage_signature,
    pushpackage_website_json
]

def supports_web_apn(web_apn_id):
    if notifications['web_apn_id'] == '' or notifications['web_apn_id'] is None:
        return False
    elif notifications['web_apn_id'] != web_apn_id:
        return False
    else:
        return True

def create_signature():
    """
    Creates a signature of the manifest signed with the PKCS#12
    """
    pushpackage_path = get_pushpackage_path()
    manifest_path = path.join(pushpackage_path, pushpackage_manifest)
    signature_path = path.join(pushpackage_path, pushpackage_signature)
    certificate_path = path.join(getcwd(), webapn_cert_name)
    certificate_password_path = path.join(getcwd(), webapn_cert_password_name)

    with open(certificate_password_path, 'r') as password_file:
        passphrase = password_file.read().strip()

    with open(certificate_path, 'rb') as cert_file:
        cert_data = cert_file.read()

    p12 = load_pkcs12(cert_data, passphrase)
    cert = p12.get_certificate()
    pkey = p12.get_privatekey()

    # TODO: when pyOpenSSL responds to my issue and we get a BIO_flush method then
    # we'll use that to directly to BIO instead of copying here and there
    input_bio = lib.BIO_new_file(path_string(manifest_path), b'r')
    output_bio = lib.BIO_new_file(path_string(signature_path), b'w')

    # This is now our signature
    pkcs7 = lib.PKCS7_sign(cert._x509, pkey._pkey, ffi.NULL, input_bio, PKCS7_BINARY | PKCS7_DETACHED)

    # i2d converts the internal OpenSSL type (AIS.1/i) to DER/d
    lib.i2d_PKCS7_bio(output_bio, pkcs7)

    lib.BIO_free(input_bio)
    lib.BIO_free(output_bio)


def create_website_json():
    pushpackage_path = get_pushpackage_path()
    with open(path.join(pushpackage_path, pushpackage_website_json), 'w+') as file:
        file.write(json_dumps({
            "websiteName": "Axtell",
            "websitePushID": notifications['web_apn_id'],
            "allowedDomains": [canonical_host],
            "urlFormatString": canonical_host + unquote(url_for('webapn_responder', name='%@', id='%@')),
            "authenticationToken": webapn_authentication_token,
            # We can't use url_for beacuse the base URL shouldn't be a route
            "webServiceURL": canonical_host + "/static/webapn"
        }))

def create_manifest():
    pushpackage_path = get_pushpackage_path()

    with open(path.join(pushpackage_path, pushpackage_manifest), 'w+') as file:
        hashes = {}

        for payload_name in webapn_payloads:
            # exclude manifest and signature
            if payload_name in {pushpackage_manifest, pushpackage_signature}:
                continue

            payload_item_hash = sha512()

            # from https://stackoverflow.com/a/44873382/1620622
            with open(path.join(pushpackage_path, payload_name), 'rb', buffering=0) as payload_file:
                for block in iter(lambda: payload_file.read(128*1024), b''):
                    payload_item_hash.update(block)

            hashes[payload_name] = {"hashType": "sha512", "hashValue": payload_item_hash.hexdigest()}

        file.write(json_dumps(hashes))

def create_pushpackage_zip():
    pushpackage_path = get_pushpackage_path()
    pushpackage_zip = ZipFile(get_pushpackage_zip_path(), 'w', ZIP_DEFLATED)

    for payload_item in webapn_payloads:
        pushpackage_zip.write(path.join(pushpackage_path, payload_item))

    pushpackage_zip.close()
