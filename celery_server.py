#!/usr/bin/env python3

from app.instances.celery import celery_app

celery = celery_app

if __name__ == '__main__':
    celery_app.start()
