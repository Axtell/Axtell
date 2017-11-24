#!/usr/bin/env python3
import config
from app.start import run

if __name__ == '__main__':
    run(host=config.app['host'], port=config.app['port'])
