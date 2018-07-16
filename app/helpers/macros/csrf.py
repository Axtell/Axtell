from flask import session
from app.session.csrf import csrf_token_name


def get_csrf():
    return session.get(csrf_token_name, '')
