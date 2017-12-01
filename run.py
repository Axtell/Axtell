#!/usr/bin/env python3
import config
from app.start import run, server

def run_server(host=config.app['host'], port=config.app['port']):
    run(host, port)

if __name__ == '__main__':
    run_server()
