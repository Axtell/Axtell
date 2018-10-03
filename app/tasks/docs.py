from subprocess import Popen, PIPE
from threading import local
from struct import pack

from app.instances.celery import celery_app
from misc import docs_exe

docs_local = local()


def fork_docs_helper():
    if not (hasattr(docs_local, 'render_proc') and docs_local.render_proc is not None):
        docs_local.render_proc = Popen(['node', docs_exe], stdout=PIPE, stdin=PIPE)

    return docs_local.render_proc


@celery_app.task
def render_docs(string):
    helper = fork_docs_helper()

    helper.stdin.write(string.encode('utf-8'))
    helper.stdin.flush()

    markdown_len = int.from_bytes(helper.stdout.read(4), byteorder='little')
    markdown = helper.stdout.read(markdown_len).decode('utf-8')

    frontmatter_params = dict()

    frontmatter_param_count = int.from_bytes(helper.stdout.read(4), byteorder='little')
    for _ in range(frontmatter_param_count):
        frontmatter_key_len = int.from_bytes(helper.stdout.read(4), byteorder='little')
        frontmatter_key = helper.stdout.read(frontmatter_key_len).decode('utf-8')

        frontmatter_value_len = int.from_bytes(helper.stdout.read(4), byteorder='little')
        frontmatter_value = helper.stdout.read(frontmatter_value_len).decode('utf-8')

        frontmatter_params[frontmatter_key] = frontmatter_value

    headings = dict()

    headings_count = int.from_bytes(helper.stdout.read(4), byteorder='little')
    for _ in range(headings_count):
        headings_key_len = int.from_bytes(helper.stdout.read(4), byteorder='little')
        headings_key = helper.stdout.read(headings_key_len).decode('utf-8')

        headings_value_len = int.from_bytes(helper.stdout.read(4), byteorder='little')
        headings_value = helper.stdout.read(headings_value_len).decode('utf-8')

        headings[headings_key] = headings_value

    return markdown, frontmatter_params, headings
