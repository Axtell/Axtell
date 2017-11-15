#!/usr/bin/env python3

from app.helpers.tasks import celery_app

if __name__ == '__main__':
    celery_app.start()
