#!/usr/bin/env sh
celery multi start w1 -A celery_server
FLASK_APP=app/start.py flask run
