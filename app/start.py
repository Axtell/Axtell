from app.app import app
import app.routes

def run(host, port):
    app.run(host=host, port=port)
