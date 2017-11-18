from app.instances.celery import celery_app
from subprocess import Popen, PIPE
from misc import md_exe

render_proc = None

@celery_app.task
def render_markdown(string):
    global render_proc
    
    if render_proc is None:
        render_proc = Popen(['node', md_exe], stdout=PIPE, stdin=PIPE, stderr=None)
    
    render_proc.stdin.write(string.encode('utf-8'))
    render_proc.stdin.flush()
    read_len = int.from_bytes(render_proc.stdout.read(4), byteorder='little')
    return render_proc.stdout.read(read_len).decode('utf-8')
