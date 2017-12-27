#!/usr/bin/env python3
import config
from app.start import run, server
from app.routes import *

import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler('ppcg-v2.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)
server.logger.addHandler(handler)

def run_server(host=config.app['host'], port=config.app['port']):
    run(host, port)

if __name__ == '__main__':
    run_server()
