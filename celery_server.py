#!/usr/bin/env python3

import app.instances.celery

# noinspection PyUnresolvedReferences
from app.tasks import *

celery = app.instances.celery.celery_app

if __name__ == '__main__':
    celery.start()
