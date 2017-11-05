#!/usr/bin/env python3

import mysql.connector
from flask import Flask, render_template

import config

app = Flask("PPCG v2")

@app.route("/")
def hello():
    return render_template('index.html')


@app.route("/post/<int:post_id>/<post_title>")
def get_post(post_id, post_title):
    cursor = db_conn.cursor()
    post_data = next(cursor.execute("SELECT * FROM posts WHERE id = %s", (post_id,)))
    cursor.close()
    return render_template('post.html', post_data=post_data)


if __name__ == '__main__':
    db_conn = None
    try:
        db_conn = mysql.connector.connect(**config.db_config)
        app.run()
    finally:
        if db_conn is not None:
            db_conn.close()
