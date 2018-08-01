from app.models.Answer import Answer
from app.models.Post import Post
from app.models.Language import Language

"""
This includes helper functions which obtains
the body for a notification by querying various
models.
"""

def new_answer(notification):
    """
    Obtains a new answer body for notifs where **source is
    the post**
    """
    answer = Answer.query.filter_by(id=notification.target_id).first()
    post = Post.query.filter_by(id=notification.source_id).first()

    if not isinstance(answer, Answer):
        return "A new unavailable answer has been posted."

    if not isinstance(post, Post):
        post_name = "n/a"
    else:
        post_name = post.title

    language = answer.get_language()
    if not isinstance(language, Language):
        language_name = "new"
    else:
        language_name = f"{language.get_display_name()}"

    byte_count = answer.byte_len

    return f"A {language_name} answer has been posted to your challenge, \"{post_name}\", measuring at {byte_count} bytes!"
