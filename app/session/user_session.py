from uuid import uuid4

from flask import session

from app.instances.db import redis_db
from app.models.User import User
from app.models.Theme import Theme

userid_skey = 'uid'
skey_prefix = 'sid:'

# In seconds
session_time = 60 * 60 * 24


def get_session_user(current_session=None):
    if current_session is None:
        current_session = session
    # If there is a session ID.
    if userid_skey in current_session:
        # Look it up in redis
        session_id = current_session[userid_skey]
        redis_key = skey_prefix + session_id
        user_id = redis_db.get(redis_key)

        # If the session id is bogus, remove it
        if user_id is None:
            current_session.pop(userid_skey, None)
            return

        # Otherwise lookup user in DB
        matched_user = User.query.filter_by(id=user_id).first()

        # If no DB entry for the user. Redis & session id are both bogus, delete
        # them
        if matched_user is None:
            current_session.pop(userid_skey, None)
            redis_db.delete(redis_key)
            return

        # Now that we have the user we'll set it
        return matched_user


def reset_session_time(current_session=None):
    if current_session is None:
        current_session = session
    session_id = current_session[userid_skey]
    redis_key = skey_prefix + session_id
    redis_db.expire(redis_key, session_time)


def set_session_user(user, current_session=None):
    """
    Takes a User ORM object and sets the session to that user.
    """
    if current_session is None:
        current_session = session

    user_id = user.id
    user_theme = Theme.query.filter_by(id=user.theme).first().name()
    session_id = str(uuid4())
    redis_skey = skey_prefix + session_id

    # Add this to redis
    redis_db.set(redis_skey, user_id)
    redis_db.expire(redis_skey, session_time)

    # Set on session
    current_session[userid_skey] = session_id
    current_session['theme'] = user_theme


def remove_session_user(current_session=None):
    """
    If there is a user for the session. Logs that user out
    """
    if current_session is None:
        current_session = session
    if userid_skey not in current_session:
        return
    # Get session ID
    session_id = current_session[userid_skey]

    # Remove session ID from redis
    redis_db.delete(skey_prefix + session_id)

    # Remove the session key
    current_session.pop(userid_skey, None)
