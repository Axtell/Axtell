import app.flask
import app.db
from flask import Flask, render_template, redirect

@app.route("/")
def hello():
    return render_template('index.html')

@app.route("/post/<int:post_id>")
@app.route("/post/<int:post_id>/<post_title>")
def get_post(post_id, post_title = None):
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM posts WHERE id = %s", (post_id,))
    post_data = cursor.fetchone()
    cursor.close()
    if post_data is None:
        return render_template('notfound.html'), 404
    return render_template('post.html', post_data=post_data)
