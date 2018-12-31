from flask import g, abort, redirect, url_for, render_template
from app.instances import db
from ast import literal_eval

def get_duplicate_users():
    # SQLAlchemy doesn't have native support for MySQL views,
    # so we use raw SQL here - need to find a better method eventually
    result = db.engine.execute('SELECT * FROM duplicate_users')
    data = []
    for row in result:
        user_ids = literal_eval(row[1])
        user_names = literal_eval(row[2])
        users = map(
            lambda user: {'id': str(user[0]), 'name': user[1]},
            zip(user_ids, user_names)
        )
        data.append({'ip': row[0], 'users': users})
    return data
