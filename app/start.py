import app.server

# noinspection PyUnresolvedReferences
# This statement needs to be here in order to link the routes.
# Since all the work is being done by the code in the routes modules being run,
# Nothing from the modules actually gets called from something external.
import app.routes

# Sets up authorization middleware.
import app.instances.auth

# Sets up Celery connection
from app.tasks import *

# Delayed loading of table data to fix insane import issues
import app.models

app.models.Post.delayed_load()
app.models.Answer.delayed_load()

# Exports server to please Flask CLI
server = app.server.server


def run(host, port):
    app.server.server.run(host=host, port=port)
