#!/usr/bin/env python3

from celery import Celery
from app.instances import db
from app.models import User
from config import redis_config
from os import path
from subprocess import Popen, PIPE
from struct import unpack

redis_url = f"redis://:{redis_config['password']}@{redis_config['host']}:{redis_config['port']}/{redis_config['db']}"

celery_app = Celery(
    "celery_server",
    broker=redis_url,
    backend=redis_url
)
db_session = None
render_proc = None


@celery_app.task
def init():
    global db_session, render_proc
    db_session = db.db.session()
    exec_path = path.join(path.dirname(path.realpath(__file__)), 'markdown', 'markdown.js')
    render_proc = Popen(['node', exec_path], stdout=PIPE, stdin=PIPE)


@celery_app.task
def create_user(name, email):
    global db_session
    new_user = User(name=name, email=email)
    db_session.add(new_user)
    db_session.commit()
    return new_user.to_json()


@celery_app.task
def render_markdown(string):
    render_proc.stdin.write(string.encode('utf-8'))
    render_proc.stdin.flush()
    read_len, = unpack('<i', render_proc.stdout.read(4))
    return render_proc.stdout.read(read_len).decode('utf-8')
