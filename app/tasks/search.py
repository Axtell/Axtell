from app.helpers import search_index
from app.instances.celery import celery_app
from app.models.Post import Post
from app.models.Answer import Answer
from app.models.User import User
from app.instances import db

from itertools import zip_longest


# This is how many sync tasks should be dispatched per worker. You don't want this
# to be so small because eventually the messaging overhead will be greater than
# the network overhead
UPLOAD_QUEUE_CHUNK_SIZE = 8

# We will batch indexes into one request so this is how many per. Generally we
# don't want to be sending more than 64KB per request.
UPLOAD_QUEUE_BATCH_SIZE = 4

# List of models which conform to the index interface.
INDEXABLE_MODELS = [Post, Answer, User]


@celery_app.task
def initialize_indices():
    for model in INDEXABLE_MODELS:
        index = model.get_index()
        index.set_settings(model.get_index_settings())


@celery_app.task
def reindex_database(full_reindex=False):
    if search_index.client is None:
        return

    if full_reindex:
        indexable_items = [item for model in INDEXABLE_MODELS for item in model.query.all()]
    else:
        indexable_items = [
            item for model in INDEXABLE_MODELS for item in model.query.filter_by(index_status=search_index.IndexStatus.UNSYNCHRONIZED).all()
        ]

    sync_targets = [(item.get_index_json(batch_object=True),) for item in indexable_items]

    synchronize_objects.chunks(
        # This may look crazy but basically takes the `sync_targets` and
        # splits it into chunks of size `UPLOAD_QUEUE_BATCH_SIZE`. Then the
        # for..in wraps it in a tuple so celery understands that each instance
        # is a single argument.
        [(item,) for item in zip_longest(*[iter(sync_targets)] * UPLOAD_QUEUE_BATCH_SIZE)],
        UPLOAD_QUEUE_CHUNK_SIZE
    ).delay().get(disable_sync_subtasks=False)

    for item in indexable_items:
        item.index_status = search_index.IndexStatus.SYNCHRONIZED

    db.session.commit()


@celery_app.task
def synchronize_objects(task_jsons):
    """
    Ensure you commit after calling this as this will update the synchronized
    constraints.
    """

    # This stores the index and the items to place into that so we can combine
    # the queries to avoid excessive requests.

    search_index.client.batch([*filter(None, task_jsons)])
