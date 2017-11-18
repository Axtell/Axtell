#!/usr/bin/env python3

import app.helpers.tasks

celery = app.helpers.tasks.celery_app

if __name__ == '__main__':
    app.helpers.tasks.celery_app.start()
