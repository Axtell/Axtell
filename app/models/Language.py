from misc import lang_path
from json import loads as json_loads
from hashlib import md5

# JSON of languages
with open(lang_path) as lang_data:
    languages = json_loads(lang_data.read())

class Language(object):
    """
    Supplies all known information about a language. Make an instance using the
    language id. If a language does not exist then this will *not* error however
    some functions will return `None` appropriately.
    """
    def __init__(self, lang_id):
        self._id = Language.normalize(lang_id)

        # Should not fail otherwise you have malformed source code
        self._data = languages['languages'][self._id]

    def get_color(self):
        # TODO: replace with CB-palette
        return '#666699'

    def get_short_id(self):
        second_char = self._id[1] if len(self._id) > 1 else ""
        return self._data.get('sn', self._id[0].upper() + second_char)

    def get_display_name(self):
        # Return display name. If that doesn't exist, capitalize each letter
        # following a whitespace char

        if self._data is None:
            return None

        return self._data.get('display', this._id.title())

    def to_json(self):
        """
        May not return a JSON object
        """
        return self._id

    def get_id(self):
        """
        Returns common language id.
        """
        return self._id

    def get_tio_id(self):
        """
        Returns the id as a string or None if the languages is not supported on
        TIO.
        """
        if self._data is None:
            return None

        tio_id = languages['tio'].get(self._id, self._id)

        # 0 in JSON means TIO is not supported
        if tio_id == 0:
            return None

        return tio_id

    @classmethod
    def normalize(cls, lang_id):
        """
        Normalizes a language id (resolves aliases/lowercasing)
        """
        normalized_id = lang_id.lower()
        return languages['alias'].get(lang_id, lang_id)

    @classmethod
    def exists(cls, lang_id):
        """
        Determines if a lang_id exists.
        """
        return cls.normalize(lang_id) in languages['languages']
