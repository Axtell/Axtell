from app.models.PushNotificationDevice import PushNotificationDevice
from app.instances.db import db, redis_db
from app.models.User import User

from uuid import UUID
from M2Crypto.m2 import rand_bytes


pn_redis_id_prefix = 'pn-id:'
pn_redis_id_time = 60 * 2 # In seconds


def is_valid_webapn_version(version):
    return version == 1 or version == 2

def add_push_notification_device(user, device_id, provider):
    notification = PushNotificationDevice(device_id=device_id, provider=provider, user=user)
    db.session.add(notification)
    db.session.commit()

def get_temporary_id_user(authorization_token):
    """
    Gets user given a temporary id
    """
    redis_key = pn_redis_id_prefix + authorization_token
    user_id = redis_db.get(redis_key)

    if user_id is None:
        return None

    redis_db.delete(redis_key)

    user = User.query.filter_by(id=user_id).first()
    return user

def generate_temporary_id():
    """
    For an authorized user. This generates a temporary (5 min lifetime)
    that identifies the user. This
    """

    webapn_id = UUID(bytes=rand_bytes(16))
    redis_key = pn_redis_id_prefix + webapn_id
    redis_db.set(redis_key, g.user.id)
    redis_db.expire(redis_key, pn_redis_id_time)

    return webapn_id
