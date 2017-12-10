from subprocess import Popen, PIPE
from threading import local
from struct import pack

from app.instances.celery import celery_app
from misc import hljs_exe

highlight_local = local()


def fork_highlight_helper():
    if not (hasattr(highlight_local, 'render_proc') and highlight_local.render_proc is not None):
        highlight_local.render_proc = Popen(['node', hljs_exe], stdout=PIPE, stdin=PIPE)

    return highlight_local.render_proc


@celery_app.task
def syntax_highlight(string, lang):
    helper = fork_highlight_helper()

    lang_name = lang.encode('utf-8')
    data = pack('<I', len(lang_name)) + lang_name + string.encode('utf8')

    helper.stdin.write(data)
    helper.stdin.flush()
    read_len = int.from_bytes(helper.stdout.read(4), byteorder='little')
    res = helper.stdout.read(read_len).decode('utf-8')

    return res
