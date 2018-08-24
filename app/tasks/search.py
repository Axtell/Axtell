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
        indexable_items = [items for model in INDEXABLE_MODELS for item in model.query.all()]
    else:
        indexable_items = [
            items for model in INDEXABLE_MODELS for item in model.query.filter_by(index_status=search_index.IndexStatus.UNSYNCHRONIZED).all()
        ]

    sync_targets = [(item.get_index(get_index_name=True), item.get_index_json()) for item in indexable_items]

    try:
        synchronize_objects.chunks(
            # This may look crazy but basically takes the `sync_targets` and
            # splits it into chunks of size `UPLOAD_QUEUE_BATCH_SIZE`. Then the
            # for..in wraps it in a tuple so celery understands that each instance
            # is a single argument.
            [(chunk,) for chunk in zip_longest(*[iter(sync_targets)] * UPLOAD_QUEUE_BATCH_SIZE)],
            UPLOAD_QUEUE_CHUNK_SIZE
        ).delay().get(disable_sync_subtasks=False)
    finally:
        for item in indexable_items:
            item.index_status = search_index.IndexStatus.SYNCHRONIZED

        db.session.commit()


@celery_app.task
def synchronize_objects(items):
    """
    Ensure you commit after calling this as this will update the synchronized
    constraints.
    """

    # This stores the index and the items to place into that so we can combine
    # the queries to avoid excessive requests.
    objects = dict()

    for params in items:
        if params is None:
            continue

        index_name, item_json = params
        objects.setdefault(index_name, []).append(item_json)

    for index, items in objects.items():
        search_index.load_index(index_name).add_objects(items)






