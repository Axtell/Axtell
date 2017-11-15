from flask import g
from app.server import server
from app.session import user_session

userid_skey = 'uid'
skey_prefix = 'sid:'


@server.before_request
def setup_current_user():
    g.user = user_session.get_session_user()
    
    if g.user is not None:
        user_session.reset_session_time()
