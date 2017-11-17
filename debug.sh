#!/usr/bin/env sh
celery multi start w1 -A celery_server
FLASK_DEBUG=1 FLASK_APP=app/start.py flask run --host=0.0.0.0
