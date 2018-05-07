import app.tasks.markdown as markdown
from config import comments as comment_config

# max_depth = 1 will only load top-level comments
def get_rendered_comments(cls, parent_id=None, max_depth=1, count=comment_config['show_amt'], **kwargs):
    rendered_comments = []
    comments = cls.query.filter_by(parent_id=parent_id, **kwargs).order_by(cls.date_created.desc()).limit(5).all()
    comment_len = cls.query.filter_by(parent_id=parent_id, **kwargs).count()

    for comment in comments:
        # Get child comments
        if max_depth > 1:
            child_comments = get_rendered_comments(cls, parent_id=comment.id, max_depth=max_depth - 1, count=comment_config['nest_amt'], **kwargs)
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
