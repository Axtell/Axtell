from jwcrypto.jwk import JWKSet
from urllib.request import urlopen

jwkeys = JWKSet()
jwk_sets = [
    'https://www.googleapis.com/oauth2/v3/certs'
]

for keyurl in jwk_sets:
    with urlopen(keyurl) as key:
        jwkeys.import_keyset(key.read().decode())
