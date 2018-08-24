from app.helpers import search_index
from app.instances.celery import celery_app


# This is how many sync tasks should be dispatched per worker. You don't want this
# to be so small because eventually the messaging overhead will be greater than
# the network overhead
UPLOAD_QUEUE_CHUNK_SIZE = 30

def should_process_object(item):
    """
    Determines if a model should be
    sent to search index
    """

    return client is not None

@celery_app.task
def reindex_database():
    pass
    # from app.models.Post import Post
    # from app.models.Answer import Answer
    # from app.models.User import User
    # from app.instances import db

    # unsynced_posts = Post.query.with_for_update().filter_by(index_status=search_index.IndexStatus.UNSYNCHRONIZED).all()
    # unsynced_answers = Answer.query.with_for_update().filter_by(index_status=search_index.IndexStatus.UNSYNCHRONIZED).all()
    # unsynced_users = User.query.with_for_update().filter_by(index_status=search_index.IndexStatus.UNSYNCHRONIZED).all()

    # items = [*unsynced_posts, *unsynced_answers, *unsynced_users]

    # syncronize_objects.chunk(
    #     [*unsynced_posts, *unsynced_answers, *unsynced_users],
    #     UPLOAD_QUEUE_CHUNK_SIZE
    # ).delay().get(disable_sync_subtasks=False)

    # db.session.commit()


@celery_app.task
def syncronize_objects(items):
    """
    Ensure you commit after calling this as this will update the synchronized
    constraints.
    """

    objects = dict()

    for item in items:
        if should_process_object(item):
            index = item.get_index()
            objects.setdefault(index, set()).add(item.to_index_json())

    for index, objects in objects:
        index.add_objects(objects)

    for item in items:
        item.index_status = search_index.IndexStatus.SYNCHRONIZED





