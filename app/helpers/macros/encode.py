from flask import request
from json import dumps as json_encode, loads as json_decode
from base64 import b64encode, b64decode

def json_to_b64(json):
    return b64encode(json_encode(json).encode('utf8')).decode('utf8')

def json_to_str(json):
    return json_encode(json)

def b64_to_json(json):
    return json_decode(b64decode(json))

def encode_state(provider):
    return json_to_b64({'provider':provider, 'redirect':request.url})
