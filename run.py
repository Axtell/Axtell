#!/usr/bin/env python3
import app.start
import config

if __name__ == '__main__':
    app.start.run(host=config.app['host'], port=config.app['port'])
