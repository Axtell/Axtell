#!/usr/bin/env python3

from celery import Celery
from app.instances import db
from app.models import User
from config import redis_config

redis_url = f"redis://:{redis_config['password']}@{redis_config['host']}:{redis_config['port']}/{redis_config['db']}"

celery_app = Celery(
    "celery_server",
    broker=redis_url,
    backend=redis_url
)
db_session = None


@celery_app.task
def init():
    global db_session
    db_session = db.db.session()


@celery_app.task
def create_user(name, email):
    global db_session
    new_user = User(name=name, email=email)
    db_session.add(new_user)
    db_session.commit()
    return new_user.to_json()
