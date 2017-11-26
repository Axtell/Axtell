from os import path, getcwd

from flask import request, abort

import app.tasks as tasks
from app.server import server


@server.route("/update", methods=["POST"])
def update():
    key = request.form['key']
    commit = request.form['commit']
    with open(path.join(getcwd(), "deploy.txt")) as f:
        if commit == f.read():
            print("Trying to update...")
            if tasks.update.update.delay(commit).wait():
                print("Successfully updated")
                return 'success', 200
            else:
                print("Failed to update")
                return 'failure', 500
        else:
            return abort(403)
