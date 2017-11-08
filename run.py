#!/usr/bin/env python3
from app.start import run
from app.db import db_conn

if __name__ == '__main__':
    try:
        run(host='127.0.0.1', port=5000)
    finally:
        if db_conn is not None:
            db_conn.close()
