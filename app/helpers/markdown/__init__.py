from app.instances.db import redis_db
from subprocess import Popen, PIPE
from os import path
from struct import unpack

exec_path = path.join(path.dirname(path.realpath(__file__)), 'markdown.js')

# Keep process running
render_proc = Popen(['node', exec_path], stdout=PIPE, stdin=PIPE)

def render_markdown(string, id=None, force=False):
    """
    Renders markdown.
    
    Parameters:
     - string(str): Markdown string to render.
     - id(number): If provided, this will enable caching by identifying the
        markdown string with the Id.
     - force(bool): If provided with an id, this will force a new rendering and
        reset the cache
    
    Returns: rendered string
    """
    render_proc.stdin.write(string.encode('utf-8'))
    render_proc.stdin.flush()
    read_len, = unpack('<i', render_proc.stdout.read(4))
    return render_proc.stdout.read(read_len).decode('utf-8')
    

def clear_markdown_cache(id):
    pass
