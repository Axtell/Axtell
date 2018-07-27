from app.helpers.render import render_template
from app.controllers import user
from app.models.User import User
from app.server import server

from flask import g, request, redirect, url_for, abort


# noinspection PyUnusedLocal
@server.route("/user/data/me", methods=['GET'])
def get_my_profile():
    return user.get_my_profile()


@server.route("/users/data/<int:user_id>", methods=['GET'])
def get_profile(user_id):
    return user.get_profile(user_id)


@server.route("/user/<int:target_user_id>/follow", methods=['POST'])
def follow_user(target_user_id):
    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    return user.follow(g.user.id, target_user_id)


@server.route("/user/<int:target_user_id>/unfollow", methods=['POST'])
def unfollow_user(target_user_id):
    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    return user.unfollow(g.user.id, target_user_id)


@server.route("/user/<int:user_id>", defaults={"name": None})
@server.route("/user/<int:user_id>/<name>")
def get_user(user_id, name):
    matched_user = User.query.filter_by(id=user_id).first()

    # Redirect if name is incorrect. add 'r=y' flag to avoid infinite redirection in
    # exceptional circumstances
    if name != matched_user.name and request.args.get('r', 'n') != 'y':
        return redirect(url_for('get_user', user_id=user_id, name=matched_user.name, **request.args, r='y'), code=301)

    if matched_user is None:
        return abort(404)

    return render_template('user.html', user=matched_user)
