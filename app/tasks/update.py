from app.instances.celery import celery_app
from subprocess import Popen, PIPE, run

@celery_app.task
def update(commit):
    return run(["git", "checkout", commit]).returncode == 0
