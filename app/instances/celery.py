#!/usr/bin/env python3

from celery import Celery
from config import redis_config

redis_url = f"redis://:{redis_config['password']}@{redis_config['host']}:{redis_config['port']}/{redis_config['db']}"

celery_app = Celery(
    "celery_server",
    broker=redis_url,
    backend=redis_url
)
