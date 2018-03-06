from urllib.request import urlopen

from jwcrypto.jwk import JWKSet

jwkeys = JWKSet()
jwk_sets = [
    'https://www.googleapis.com/oauth2/v3/certs'
]


def load_keys():
    for keyurl in jwk_sets:
        with urlopen(keyurl) as key:
            jwkeys.import_keyset(key.read().decode())
