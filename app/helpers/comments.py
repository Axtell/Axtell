import app.tasks.markdown as markdown
from app.models.PostComment import PostComment
from app.models.AnswerComment import AnswerComment
from config import comments as comment_config

def get_comment_notification_targets(comment):
    """
    Gets a list of comments that should get a notification
    about this new comment

    :param PostComment|AnswerComment comment:
    :param set user_ids: set of user_ids to exclude
    :return: returns a tuple, first item is comments to
             notify, second is if the post owner should
             be notified.
    """

    # A list of user_id: and the comment we are notifying
    notifications = {}

    current_comment = comment.parent
    while isinstance(current_comment, (AnswerComment, PostComment)):
        # Associate a user with which one of their comments is being erplied to
        notifications[current_comment.user_id] = current_comment
        current_comment = current_comment.parent


    return notifications

# max_depth = 1 will only load top-level comments
def get_rendered_comments(cls, parent_id=None, max_depth=1, count=comment_config['show_amt'], **kwargs):
    rendered_comments = []
    comments = cls.query.filter_by(parent_id=parent_id, **kwargs).order_by(cls.date_created.desc()).limit(count).all()
    comment_len = cls.query.filter_by(parent_id=parent_id, **kwargs).count()

    for comment in comments:
        # Get child comments
        if max_depth > 1:
            child_comments = get_rendered_comments(cls, parent_id=comment.id, max_depth=max_depth - 1, count=comment_config['nest_amt'], **kwargs)
        else:
            if len(comment.children) > 0:
                child_comments = (True, [])
            else:
                child_comments = (False, [])

        rendered_comments.append(
            (
                markdown.render_markdown.delay(comment.text).wait(),
                child_comments,
                comment
            )
        )

    # return tuple (canShowMore, renderedComments[])
    return (comment_len > count, rendered_comments)
