#!/usr/bin/env python3

import app.instances.celery
from misc import import_submodules
import app.tasks
import_submodules(app.tasks)

celery = app.instances.celery.celery_app

if __name__ == '__main__':
    celery.start()
