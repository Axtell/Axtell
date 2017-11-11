#!/usr/bin/env python3
from app.start import run
import config

if __name__ == '__main__':
    run(host=config.app['host'], port=config.app['port'])
