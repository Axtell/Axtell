#!/usr/bin/env sh
if [ -f w1.pid ]; then
    if ps -p $(< w1.pid) > /dev/null 2>&1; then
        kill $(< w1.pid)
        rm w1.pid
        echo "Restarted Celery"
    fi
fi
celery multi start w1 -A celery_server
FLASK_DEBUG=1 FLASK_APP=app/start.py flask run
