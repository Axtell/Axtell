from app.models.Post import Post

"""
This includes helper functions which obtains
the title for a notification by querying various
models.
"""

def new_answer(notification):
    """
    Obtains a new answer title for notifs where **source is
    the post**
    """
    post = Post.query.filter_by(id=notification.source_id).first()
    if not isinstance(post, Post):
        post_name = "n/a"
    else:
        post_name = post.title

    return f"A new answer has been posted to {post_name}"
