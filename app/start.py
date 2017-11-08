from app.server import server
from app.routes import *

def run(host, port):
    server.run(host=host, port=port)
