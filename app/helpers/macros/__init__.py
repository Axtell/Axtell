from subprocess import check_output

# This contains the macros to pass to a rendering instance
from app.helpers.macros.pagination import *
from app.helpers.macros.gravatar import *
from app.helpers.macros.encode import *
from app.helpers.macros.render import *
from app.helpers.macros.uuid import *

def get_version_id():
    return check_output(["git", "rev-parse", "@"]).strip().decode('utf8')
