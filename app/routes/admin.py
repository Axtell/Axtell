from flask import request, redirect, url_for, abort, g
from app.session.authorization import is_admin_json
from app.helpers.render import render_error, render_json, render_template
from app.server import server
import app.controllers.admin as admin_controller


@is_admin_json
@server.route("/admin/duplicate_users")
def duplicate_users():
    return render_template('admin/duplicate_users.html', data=admin_controller.get_duplicate_users())