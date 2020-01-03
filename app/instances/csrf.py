from uuid import UUID
from os import urandom

from flask import session
from app.session.csrf import csrf_token_name
from app.server import server


@server.before_request
def setup_csrf():
    if csrf_token_name not in session:
        session[csrf_token_name] = str(UUID(bytes=urandom(16)))
