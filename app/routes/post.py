from app.server import server
from app.helpers.render import render_template
from flask import redirect, url_for, g

@server.route("/posts")
def get_posts():
    return render_template('posts.html')

@server.route("/post/write")
def write_post():
    if g.user is None:
        return redirect(url_for('home'))
    
    return render_template('post/write.html')
