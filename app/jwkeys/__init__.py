from jwcrypto.jwk import JWKSet
from os import path

jwkeys = JWKSet()
jwk_sets = [
    'google'
]

key_path = path.abspath(path.dirname(__file__))
for key in jwk_sets:
    key_name = key + '.jwk.json'
    with open(path.join(key_path, key_name), 'r') as keyfile:
        jwkeys.import_keyset(keyfile.read())
