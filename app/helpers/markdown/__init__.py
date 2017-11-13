from app.instances.db import redis_db
from subprocess import Popen, PIPE
from os import path
from struct import unpack
from config import post_len

exec_path = path.join(path.dirname(path.realpath(__file__)), 'markdown.js')

# Keep process running
render_proc = Popen(['node', exec_path], stdout=PIPE, stdin=PIPE)

# Prefix for renders in redis
md_id = "md:"

# In seconds
md_expire = 60 * 60 * 24 * 7 # 7 days

def raw_render(string):
    render_proc.stdin.write(string.encode('utf-8'))
    render_proc.stdin.flush()
    read_len, = unpack('<i', render_proc.stdout.read(4))
    return render_proc.stdout.read(read_len).decode('utf-8')

def render_markdown(string, id=None, force=False):
    """
    Renders markdown.
    
    Parameters:
     - string(str): Markdown string to render.
     - id(str): If provided, this will enable caching by identifying the
        markdown string with the Id.
     - force(bool): If provided with an id, this will force a new rendering and
        reset the cache
    
    Returns: rendered string
    """
    
    redis_key = md_id + id
    if id is not None and not force:
        cache = redis_db.get(redis_key)
        if cache is not None:
            return cache.decode('utf-8')
    
    result = raw_render(string)
    redis_db.set(redis_key, result)
    redis_db.expire(redis_key, md_expire)
    return result

def render_markdown_safe(string, **kwargs):
    if len(string) > post_len: return None
    return render_markdown(string, **kwargs)

def clear_markdown_cache(id):
    redis_db.delete(id)
