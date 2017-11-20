from flask import g
from app.server import server
import app.session.user_session

userid_skey = 'uid'
skey_prefix = 'sid:'


@server.before_request
def setup_current_user():
    g.user = app.session.user_session.get_session_user()
    
    if g.user is not None:
        app.session.user_session.reset_session_time()
