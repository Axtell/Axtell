#!/usr/bin/env python3
import app.start

if __name__ == '__main__':
    try:
        run(host='127.0.0.1', port=5000)
    finally:
        if db_conn is not None:
            db_conn.close()
