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
    @wraps(f)
    def wrap(root_object=True, *args, **kwargs):
        result = f(*args, **kwargs)

        if not root_object:
            result.pop('objectID', None)

        return result

    return wrap


loaded_indices = {}
def gets_index(f):
    """
    Obtains an index by full name. You should use `get_index_name` before this.
    Returns an algolia index object. If algolia is not confiured this will
    return `None`.
    """

    @wraps(f)
    def wrap():
        index_name = f()
        if client is not None:
            if index_name in loaded_indices:
                return loaded_indices[index_name]
            else:
                if not auth['algolia']['prefix']:
                    algolia_name = index_name
                else:
                    algolia_name = f"{auth['algolia']['prefix']}-{index_name}"

                index = client.init_index(algolia_name)
                loaded_indices[index_name] = index
                return index
        else:
            return None

    return wrap
