import app.models
from app.instances.db import redis_db
from flask import session
from uuid import uuid4

userid_skey = 'uid'
skey_prefix = 'sid:'

# In seconds
session_time = 60 * 60 * 24


def get_session_user():
    # If there is a session ID.
    if userid_skey in session:
        # Look it up in redis
        session_id = session[userid_skey]
        redis_key = skey_prefix + session_id
        user_id = redis_db.get(redis_key)
        
        # If the session id is bogus, remove it
        if user_id is None:
            session.pop(userid_skey, None)
            return
        
        # Otherwise lookup user in DB
        matched_user = app.models.User.User.query.filter_by(id=user_id).first()
        
        # If no DB entry for the user. Redis & session id are both bogus, delete
        # them
        if matched_user is None:
            session.pop(userid_skey, None)
            redis_db.delete(redis_key)
            return
        
        # Now that we have the user we'll est it
        return matched_user


def reset_session_time():
    session_id = session[userid_skey]
    redis_key = skey_prefix + session_id
    redis_db.expire(redis_key, session_time)


def set_session_user(user):
    """
    Takes a User ORM object and sets the session to that user.
    """
    user_id = user.id
    session_id = str(uuid4())
    redis_skey = skey_prefix + session_id
    
    # Add this to redis
    redis_db.set(redis_skey, user_id)
    redis_db.expire(redis_skey, session_time)
    
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
    redis_db.delete(skey_prefix + session_id)
    
    # Remove the session key
    session.pop(userid_skey, None)
