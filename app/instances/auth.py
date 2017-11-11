from flask import g, session
from app.server import server
from app.models.User import User
from app.instances.db import r

userid_skey = 'uid'
skey_prefix = 'sid:'

# In seconds
session_time = 60 * 60 * 24

@server.before_request
def setup_current_user():
    g.user = None
    
    # If there is a session ID.
    if userid_skey in session:
        # Look it up in redis
        session_id = session[userid_skey]
        redis_key = skey_prefix + session_id
        user_id = r.get(redis_key)
        
        # If the session id is bogus, remove it
        if user_id is None:
            session.pop(userid_skey, None)
            return
        
        # Otherwise lookup user in DB
        matched_user = User.query.filter_by(id=user_id).first()
        
        # If no DB entry for the user. Redis & session id are both bogus, delete
        # them
        if matched_user is None:
            session.pop(userid_skey, None)
            r.delete(redis_key)
            return
        
        # Now that we have the user we'll est it
        g.user = matched_user
        
        # Additionally refresh the token
        r.expire(redis_key, session_time)
