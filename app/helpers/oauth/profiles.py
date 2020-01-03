import requests
from config import auth
from html import unescape as html_unescape


def stackexchange(auth_token):
    user = requests.get(
        'https://api.stackexchange.com/2.2/me',
        params={
            'site': 'codegolf',
            'filter': '!)RwcIFN1JaCrhVpgyYeR_oO*',  # Constant obtained from SE API explorer
            'access_token': auth_token,
            'key': auth.get('stackexchange.com').get('key')
        }
    ).json().get('items')[0]

    display_name = html_unescape(user.get('display_name'))

    return user.get('user_id'), {
        'name': display_name,
        'avatar': user.get('profile_image'),
        'email': None,
        'identifier': display_name
    }


def google(auth_token):
    # Gets the user's email and Google ID's to identify then
    account = requests.get(
        'https://oauth2.googleapis.com/tokeninfo',
        params={
            'access_token': auth_token
        }
    ).json()

    # Gets their name
    profile = requests.get(
        'https://people.googleapis.com/v1/people/me?personFields=names,photos',
        params={
            'access_token': auth_token
        }
    ).json()

    return account['sub'], {
        'name': profile.get('names', [{}])[0].get('displayName', 'Axtell User'),
        'email': account['email'],
        'avatar': profile.get('photos', [{}])[0].get('url', ''),
        'identifier': account['email']
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
