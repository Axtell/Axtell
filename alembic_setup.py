#!/usr/bin/env python3

from app.instances.db import server

DB_CONN = server.config['SQLALCHEMY_DATABASE_URI'].replace("+mysqlconnector", "")

with open('alembic-default.ini') as infile:
    with open('alembic.ini', 'w') as outfile:
        for line in infile:
            outfile.write(line.replace("DB_CONN", DB_CONN))
