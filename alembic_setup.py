#!/usr/bin/env python3

from app.instances.db import db_uri

DB_CONN = db_uri.replace("+mysqlconnector", "")

with open('alembic-default.ini') as infile:
    with open('alembic.ini', 'w') as outfile:
        for line in infile:
            outfile.write(line.replace("DB_CONN", DB_CONN))
