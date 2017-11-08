from app.server import server
import app.routes

def run(host, port):
    server.run(host=host, port=port)
