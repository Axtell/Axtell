from algoliasearch import algoliasearch
from config import auth

# If there is no Algolia setup
if not auth['algolia']['app-id']:
    client = None
else:
    client = algoliasearch.Client(auth['algolia']['app-id'], auth['algolia']['admin-key'])
