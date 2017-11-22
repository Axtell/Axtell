from app.instances.celery import celery_app
import markdown
import bleach


@celery_app.task
def render_markdown(string):
    return bleach.clean(markdown.markdown(string))
