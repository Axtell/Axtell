import requests
from config import auth

IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image"
IMGUR_UPLOAD_HEADERS = {'Authorization': 'Client-ID {}'.format(auth['imgur']['client-id'])}


def imgur_upload(url):
    response = requests.post(IMGUR_UPLOAD_URL, data={'image': url}, headers=IMGUR_UPLOAD_HEADERS)
    if response.ok:
        return response.json()['data']['link']
    else:
        raise RuntimeError
