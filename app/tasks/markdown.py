from app.instances.celery import celery_app
import markdown


@celery_app.task
def render_markdown(string):
    return markdown.markdown(string)
