from app.session.authorization import is_admin
from app.helpers.render import render_template, render_json
from app.server import server
import app.controllers.admin as admin_controller
from flask import redirect, abort, request
from app.session.csrf import csrf_protected


@is_admin
@server.route("/admin")
def admin_homepage():
    return render_template('admin/index.html')


@is_admin
@server.route("/admin/duplicate_users")
def duplicate_users():
    return render_template('admin/duplicate_users.html', users_data=admin_controller.get_duplicate_users())


@is_admin
@server.route("/post/nuke/<int:id>", methods=["DELETE"])
def delete_post(id):
    success = admin_controller.delete_post(id)
    if success:
        return redirect("/posts")
    else:
        return abort(400)


@is_admin
@server.route("/answer/nuke/<int:id>", methods=["DELETE"])
def delete_answer(id):
    post_id = admin_controller.delete_answer(id)
    if post_id:
        return redirect(f"/post/{post_id}")
    else:
        return abort(400)


@is_admin
@csrf_protected
@server.route("/admin/merge_users", methods=["POST"])
def merge_users():
    source_ids = request.form['source_ids']
    target_id = request.form['target_id']
    admin_controller.merge_users(source_ids, target_id)
    return render_json({'source_ids': source_ids, 'target_id': target_id, 'merge_users': True})

@is_admin
@csrf_protected
@server.route("/user/nuke/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        admin_controller.delete_user(user_id)
        return render_json({'user_id': user_id, 'nuke_user': True})
    except ValueError:
        return abort(400)


@is_admin
@csrf_protected
@server.route("/user/reset_votes/<int:user_id>", methods=["POST"])
def reset_votes(user_id):
    admin_controller.reset_votes(user_id)
    return render_json({'user_id': user_id, 'reset_votes': True})
