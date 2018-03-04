from app.helpers.render import render_template
from app.controllers import user
from app.models.User import User
from app.server import server

from flask import abort


# noinspection PyUnusedLocal
@server.route("/user/data/me", methods=['GET'])
def get_my_profile():
    return user.get_my_profile()


@server.route("/users/data/<int:user_id>", methods=['GET'])
def get_profile(user_id):
    return user.get_profile(user_id)


@server.route("/users/<int:user_id>", defaults={"name": None})
@server.route("/users/<int:user_id>/<name>")
def get_user(user_id, name):
    matched_user = User.query.filter_by(id=user_id).first()

    if matched_user is None:
        return abort(404)

    return render_template('user.html', user=matched_user)
