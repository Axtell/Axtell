from app.instances.auth import skey_prefix, userid_skey, session_time
from app.instances.db import r

from flask import session
from uuid import uuid4

def set_session_user(user):
    """
    Takes a User ORM object and sets the session to that user.
    """
    user_id = user.id
    session_id = str(uuid4())
    redis_skey = skey_prefix + session_id
    
    # Add this to redis
    r.set(redis_skey, user_id)
    r.expire(redis_skey, session_time)
    
    # Set on session
    session[userid_skey] = session_id

def remove_session_user():
    """
    If there is a user for the session. Logs that user out
    """
    if userid_skey not in session: return
    # Get session ID
    session_id = session[userid_skey]
    
    # Remove session ID from redis
    r.delete(skey_prefix + session_id)
    
    # Remove the session key
    session.pop(userid_skey, None)
