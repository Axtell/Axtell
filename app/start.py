from app.server import server

# noinspection PyUnresolvedReferences
# This statement needs to be here in order to link the routes.
# Since all the work is being done by the code in the routes modules being run,
# Nothing from the modules actually gets called from something external.
from app.routes import *

# This runs the openid file which causes it to setup open-id authentication
from app.instances import openid, auth

def run(host, port):
    server.run(host=host, port=port)
