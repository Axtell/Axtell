from app.models.Post import Post
from app.models.Answer import Answer

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

def answer_comment(notification):
    if notification.source_id is None:
        return "New comment on your answer"
    else:
        return "New reply to your comment"

def post_comment(notification):
    if notification.source_id is None:
        return "New comment on your challenge"
    else:
        return "New reply to your comment"

def outgolfed(notification):
    outgolfed_answer = Answer.query.filter_by(id=notification.source_id).first()
    if not isinstance(outgolfed_answer, Answer):
        return f"Outgolfed on a challenge"

    post = Post.query.filter_by(id=outgolfed_answer.post_id).first()
    if not isinstance(post, Post):
        return f"Outgolfed on a challenge"

    return f"Outgolfed on {post.title}"
