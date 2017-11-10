from app.server import server

# noinspection PyUnresolvedReferences
# This statement needs to be here in order to link the routes.
# Since all the work is being done by the code in the routes modules being run,
# Nothing from the modules actually gets called from something external.
from app.routes import *


def run(host, port):
    server.run(host=host, port=port)
