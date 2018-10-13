import requests
from config import oauth
from html import unescape as html_unescape


def stackexchange(auth_token):
    user = requests.get(
        'https://api.stackexchange.com/2.2/me',
        params={
            'site': 'codegolf',
            'filter': '!)RwcIFN1JaCrhVpgyYeR_oO*',  # Constant obtained from SE API explorer
            'access_token': auth_token,
            'key': oauth.get('stackexchange.com').get('key')
        }
    ).json().get('items')[0]

    display_name = html_unescape(user.get('display_name'))

    return user.get('user_id'), {
        'name': display_name,
        'avatar': user.get('profile_image'),
        'email': None,
        'identifier': display_name
    }


def github(auth_token):
    user = requests.get(
        'https://api.github.com/user',
        params={
            'access_token': auth_token
        }
    ).json()

    return user.get('id'), {
        'name': user.get('name'),
        'avatar': user.get('avatar_url'),
        'email': user.get('email'),
        'identifier': user.get('login')
    }
