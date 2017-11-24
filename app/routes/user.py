from app.controllers import user
from app.server import server


# noinspection PyUnusedLocal
@server.route("/user/me", methods=['GET'])
def get_my_profile():
    return user.get_my_profile()


@server.route("/user/<int:user_id>", methods=['GET'])
def get_profile(user_id):
    return user.get_profile(user_id)
