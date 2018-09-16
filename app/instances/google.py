from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from os.path import isfile
from functools import lru_cache


def get_credentials(path, scopes):
    """
    Reads a Google credential JSON given path of a JSON containing credentials
    :param string path: path to file of JSON
    :param list scopes: list of scopes to auth with
    """
    if not isfile(path):
        return None

    return Credentials.from_service_account_file(path, scopes=scopes)


@lru_cache(maxsize=None)
def get_analytics():
    """
    Obtains Google Analytics cred object
    """
    credentials = get_credentials('ga.json', ['https://www.googleapis.com/auth/analytics.readonly'])
    if credentials is None:
        return None

    return build('analyticsreporting', 'v4', credentials=credentials)
