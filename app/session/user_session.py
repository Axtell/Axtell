from uuid import UUID
from M2Crypto.m2 import rand_bytes
from datetime import timedelta

from time import time
from flask import session

from app.instances.redis import redis_db
from app.models.User import User
from app.models.Login import Login
from app.models.Theme import Theme

session_user_key = 'uid'

redis_session_prefix = 'sid'

redis_user_id_key = 'uid'
redis_login_id_key = 'login'

# In seconds.
session_time = int(timedelta(days=1).total_seconds())


def get_session_user(current_session=None):
    if current_session is None:
        current_session = session

    # If there is a session ID.
    if session_user_key in current_session:
        # Look it up in redis
        session_id = current_session[session_user_key]
        redis_key = f'{redis_session_prefix}:{session_id}'
        user_id = redis_db.hget(redis_key, redis_user_id_key)

        # If the session id is bogus, remove it
        if user_id is None:
            remove_session_key(session_id, current_session=current_session)
            return

        # Otherwise lookup user in DB
        matched_user = User.query.filter_by(id=user_id).first()

        # If no DB entry for the user. Redis & session id are both bogus, delete
        # them
        if matched_user is None:
            remove_session_key(session_id, current_session=current_session)
            return

        # Now that we have the user we'll set it
        return matched_user


def get_session_login(current_session=None):
    if current_session is None:
        current_session = session

    # If there is a session ID.
    if session_user_key in current_session:
        # Look it up in redis
        session_id = current_session[session_user_key]
        redis_key = f'{redis_session_prefix}:{session_id}'
        login_id = redis_db.hget(redis_key, redis_login_id_key)

        # If the session id is bogus, remove it
        if login_id is None:
            return

        # Otherwise lookup user in DB
        matched_login = Login.query.filter_by(id=login_id).first()

        # If no DB entry for the login. Redis & session id are both bogus, delete
        # them
        if matched_login is None:
            redis_db.hdel(redis_key, redis_login_id_key)
            return

        # Now that we have the user we'll set it
        return matched_login


def reset_session_time(current_session=None):
    if current_session is None:
        current_session = session
    session_id = current_session[session_user_key]
    redis_key = f'{redis_session_prefix}:{session_id}'
    redis_db.expire(redis_key, session_time)


def set_session_user(user, current_session=None):
    """
    Takes a User ORM object and sets the session to that user.
    """
    if current_session is None:
        current_session = session

    user_id = user.id
    user_theme = Theme.query.filter_by(id=user.theme).first()

    if user_theme is None:
        user_theme = 'light'
    else:
        user_theme = user_theme.name

    session_id = f'{time}:{UUID(bytes=rand_bytes(16))}'
    redis_session_key = f'{redis_session_prefix}:{session_id}'

    pipe = redis_db.pipeline()

    # Add this to redis
    # Associate the session key with the user
    pipe.hset(redis_session_key, redis_user_id_key, user_id)

    # Expire session when applicable
    pipe.expire(redis_session_key, session_time)

    pipe.execute()

    # Set on session
    current_session[session_user_key] = session_id
    current_session['theme'] = user_theme


def remove_session_user(current_session=None):
    """
    If there is a user for the session. Logs that user out
    """
    if current_session is None:
        current_session = session

    if session_user_key not in current_session:
        return

    # Get session ID
    session_id = current_session[session_user_key]

    remove_session_key(session_id, current_session=current_session)


def remove_session_key(session_id, current_session=None):
    if current_session is None:
        current_session = session

    # Remove session ID from redis
    redis_db.delete(f'{redis_session_prefix}:{session_id}')

    # Remove the session key
    current_session.pop(session_user_key, None)
