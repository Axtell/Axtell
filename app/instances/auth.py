from flask import g, session
from app.server import server
from app.controllers import user

userid_skey = 'uid'

@server.before_request
def setup_current_user():
    g.user = None
    if userid_skey in session:
        user_id = session[userid_skey]
        g.user = user.get_user_byid(user_id)
