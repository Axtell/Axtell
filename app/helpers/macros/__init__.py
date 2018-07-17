from subprocess import check_output

# This contains the macros to pass to a rendering instance
from app.helpers.macros.pagination import *
from app.helpers.macros.gravatar import *
from app.helpers.macros.encode import *
from app.helpers.macros.render import *
from app.helpers.macros.uuid import *
from app.helpers.macros.csrf import *
from app.helpers.macros.score import *


version_id = None


def get_version_id():
    global version_id

    if version_id is None:
        version_id = check_output(["git", "rev-parse", "@"]).strip().decode('utf8')

    return version_id

