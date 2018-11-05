from app.session.authorization import is_admin
from app.helpers.render import render_template
from app.server import server
import app.controllers.admin as admin_controller


@is_admin
@server.route("/admin/duplicate_users")
def duplicate_users():
    return render_template('admin/duplicate_users.html', data=admin_controller.get_duplicate_users())
