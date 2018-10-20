from flask import request, url_for
from json import dumps as json_encode, loads as json_decode
from app.helpers.oauth.config import oauth_config
from base64 import b64encode, b64decode
from slugify import slugify as slugify_str
from re import sub
from urllib.parse import quote, urlencode

import config

def json_to_b64(json):
    return b64encode(json_encode(json).encode('utf8')).decode('utf8')

def json_to_str(json):
    return json_encode(json)

def b64_to_json(json):
    return json_decode(b64decode(json))

def encode_state(provider):
    return json_to_b64({'provider':provider, 'redirect':request.url})

def encode_oauth(provider):
    provider_config = oauth_config.get(provider)

    authorize_url = provider_config.get('authorize')
    scopes = provider_config.get('scopes')

    return f'{authorize_url}?' + urlencode([*{
        'client_id': config.auth.get(provider).get('client-id'),
        'scope': " ".join(scopes),
        'state': encode_state(provider),
        'redirect_uri': config.canonical_host + url_for('auth_login_oauth')
    }.items()])

def oauth_data():
    return {
        'sites': {
            site_id: {
                **{k: v for k, v in site_data.items() if k != 'auth'},
                'client': config.auth.get(site_id).get('client-id')
            } for site_id, site_data in oauth_config.items()
        },
        'redirect_uri': config.canonical_host + url_for('auth_login_oauth')
    }

def slugify(string):
    return slugify_str(sub(r"[']", '', string))
