from app.helpers.SerializableEnum import SerializableEnum
from functools import wraps
from config import auth

from algoliasearch import algoliasearch
from config import auth


# If there is no Algolia setup
if not auth['algolia']['app-id']:
    client = None
else:
    client = algoliasearch.Client(auth['algolia']['app-id'], auth['algolia']['admin-key'])


class IndexStatus(SerializableEnum):
    UNSYNCHRONIZED = 0
    SYNCHRONIZED = 1


def index_json(f):
    """
    Obtains an index as a JSON.
    """

    @wraps(f)
    def wrap(self, root_object=True, batch_object=False, *args, **kwargs):
        result = f(self, *args, **kwargs)

        if batch_object:
            should_index = self.should_index()
            index_name = self.get_index(get_index_name=True)

            if should_index:
                return {
                    'action': 'addObject',
                    'indexName': index_name,
                    'body': result
                }
            else:
                return {
                    'action': 'deleteObject',
                    'body': {
                        'objectID': result['objectID']
                    }
                }

        if not root_object:
            result.pop('objectID', None)

        return result

    return wrap


loaded_indices = {}
def load_index(name):
    """
    Loads an index given algolia name
    """
    if name in loaded_indices:
        return loaded_indices[name]

    index = client.init_index(name)
    loaded_indices[name] = index
    return index


def gets_index(f):
    """
    Obtains an index by full name. You can use kwarg `get_index_name` to get by
    name. Otherwise this Returns an algolia index object. If algolia is not
    confiured this will return `None`.
    """

    @wraps(f)
    def wrap(self, get_index_name=False, *args, **kwargs):
        index_name = f(self, *args, **kwargs)
        if client is not None:
            if not auth['algolia']['prefix']:
                algolia_name = index_name
            else:
                algolia_name = f"{auth['algolia']['prefix']}_{index_name}"

            if get_index_name:
                return algolia_name

            return load_index(algolia_name)
        else:
            return None

    return wrap
