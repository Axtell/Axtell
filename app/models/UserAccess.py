from app.instances.db import db

from functools import wraps
import config


def admin_property(f):
    @wraps(f)
    def _check_access(user_access):
        return user_access.admin or f(user_access)
    return _check_access


def moderator_property(f):
    @wraps(f)
    def _check_access(user_access):
        return user_access.admin or user_access.moderator or f(user_access)
    return _check_access


class UserAccess(db.Model):
    """
    Access profile for a user
    """

    __tablename__ = 'user_access'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    moderator = db.Column(db.Boolean, default=False)
    admin = db.Column(db.Boolean, default=False)

    edit_own_content = db.Column(db.Boolean, default=True)
    edit_others_content = db.Column(db.Boolean, default=False)
    delete_own_content = db.Column(db.Boolean, default=True)
    delete_others_content = db.Column(db.Boolean, default=False)

    view_deleted_content = db.Column(db.Boolean, default=False)

    @moderator_property
    def can_edit_own_content(self):
        return self.edit_own_content

    @moderator_property
    def can_edit_others_content(self):
        return self.edit_others_content

    @moderator_property
    def can_delete_own_content(self):
        return self.delete_own_content

    @moderator_property
    def can_delete_others_content(self):
        return self.delete_others_content

    @moderator_property
    def can_view_deleted_content(self):
        return self.view_deleted_content
