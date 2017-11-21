from subprocess import run

from app.instances.celery import celery_app



@celery_app.task
def update(commit):
    return run(["git", "checkout", commit]).returncode == 0
