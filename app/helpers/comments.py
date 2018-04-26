import app.tasks.markdown as markdown

# max_depth = 1 will only load top-level comments
def get_rendered_comments(cls, parent_id=None, max_depth=1, **kwargs):
    rendered_comments = []
    comments = cls.query.filter_by(parent_id=parent_id, **kwargs).order_by(cls.date_created.asc()).limit(5)

    for comment in comments:
        # Get child comments
        if max_depth > 1:
            child_comments = get_rendered_comments(cls, parent_id=comment.id, max_depth=max_depth - 1, **kwargs)
        else:
            child_comments = []

        rendered_comments.append(
            (
                markdown.render_markdown.delay(comment.text).wait(),
                child_comments,
                comment
            )
        )

    return rendered_comments
