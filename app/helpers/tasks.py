#!/usr/bin/env python3

from celery import Celery
from config import redis_config
from os import path
from subprocess import Popen, PIPE, run

redis_url = f"redis://:{redis_config['password']}@{redis_config['host']}:{redis_config['port']}/{redis_config['db']}"

celery_app = Celery(
    "celery_server",
    broker=redis_url,
    backend=redis_url
)
db_session = None
render_proc = None

@celery_app.task
def create_user(name, email):
    global db_session
    if db_session is None:
        import app.instances.db
        db_session = app.instances.db.db.session()
    import app.models.User
    new_user = app.models.User.User(name=name, email=email)
    db_session.add(new_user)
    db_session.commit()
    return new_user.to_json()


@celery_app.task
def render_markdown(string):
    global render_proc
    if render_proc is None:
        exec_path = path.join(path.dirname(path.realpath(__file__)), 'markdown', 'markdown.js')
        render_proc = Popen(['node', exec_path], stdout=PIPE, stdin=PIPE, stderr=None)
    render_proc.stdin.write(string.encode('utf-8'))
    render_proc.stdin.flush()
    read_len = int.from_bytes(render_proc.stdout.read(4), byteorder='little')
    return render_proc.stdout.read(read_len).decode('utf-8')


@celery_app.task
def update(commit):
    return run(["git", "checkout", commit]).returncode == 0
