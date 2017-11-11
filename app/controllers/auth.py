from app.instances.auth import skey_prefix, userid_skey
from app.instances.db import r
from app.models.User import User
from flask import redirect, session
from uuid import uuid4

def get_or_set_user(user_id, profile):
    matched_user = User.query.filter_by(id=user_id).first()
    
    if matched_user is not None:
        return matched_user
    else:
        # Create the user with profile
        new_user = User(name=profile['name'])

def login(user):
    """
    Logs in a given user given a User object.
    """
    user_id = user.id
    session_id = str(uuid4())
    
    # Add this to redis
    r.set(skey_prefix + session_id, user_id)
    
    # Set on session
    session[userid_skey] = session_id

def logout():
    """
    Logs out a given user. The user may or may not be logged in.
    """
    if userid_skey not in session: return
    # Get session ID
    session_id = session[userid_skey]
    
    # Remove session ID from redis
    r.delete(skey_prefix + session_id)
    
    # Remove the session key
    session.pop(userid_skey, None)

def set_user(authKey, profile):
    """
    Logs in (or signs up) a new user given its authKey and a default profile
    """
    pass
