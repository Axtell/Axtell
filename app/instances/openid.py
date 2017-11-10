from flask_openid import OpenID
from app.server import server

oid = OpenID(server, '/path/to/store', safe_roots=[])
