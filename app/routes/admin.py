from app.session.authorization import is_admin
from app.helpers.render import render_template
from app.server import server
import app.controllers.admin as admin_controller
from flask import redirect, abort

@is_admin
@server.route("/admin")
def admin_homepage():
    return render_template('admin/index.html')

@is_admin
@server.route("/admin/duplicate_users")
def duplicate_users():
    return render_template('admin/duplicate_users.html', users_data=admin_controller.get_duplicate_users())

@is_admin
@server.route("/post/nuke/<int:post_id>", methods=["DELETE"])
def delete_post(id):
    success = admin_controller.delete_post(id)
    if success:
        return redirect("/posts")
    else:
        return abort(400)

@is_admin
@server.route("/answer/nuke/<int:post_id>", methods=["DELETE"])
def delete_answer(id):
    post_id = admin_controller.delete_answer(id)
    if post_id:
        return redirect(f"/post/{post_id}")
    else:
        return abort(400)
