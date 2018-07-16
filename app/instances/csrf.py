from uuid import UUID
from M2Crypto.m2 import rand_bytes

from flask import session
from app.session.csrf import csrf_token_name
from app.server import server


@server.before_request
def setup_csrf():
    if csrf_token_name not in session:
        session[csrf_token_name] = str(UUID(bytes=rand_bytes(16)))
