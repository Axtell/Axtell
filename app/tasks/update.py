import redis
from config import redis_config
from app.jwkeys import load_keys, jwkeys
from app.instances.celery import celery_app
from app.tasks.search import reindex_database


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Every 6 hours, refresh JWT keys
    sender.add_period_task(60 * 60 * 6, jwt_update.s(), name="refresh JWT")

    # Every 24 hours, reindex through database
    sender.add_period_task(60 * 60 * 6, reindex_database.s(), name="reindex database")


@celery_app.task
def jwt_update():
    load_keys()
    redis_conn = redis.StrictRedis(**redis_config)
    redis_conn.set("jwkeys", jwkeys.export())
