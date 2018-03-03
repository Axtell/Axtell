import requests
from config import oauth


def stackexchange(auth_token):
    user = requests.get(
        'https://api.stackexchange.com/2.2/me',
        params={
            'site': 'codegolf',
            'filter': '!)RwcIFN1JaCrhVpgyYeR_oO*',  # Constant obtained from SE API explorer
            'access_token': auth_token,
            'key': oauth.get('se').get('key')
        }
    ).json().get('items')[0]
    return user.get('user_id'), {
        'name': user.get('display_name'),
        'avatar': user.get('profile_image'),
        'email': None
    }
