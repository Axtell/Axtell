from app.models.Notification import Notification, NotificationType, NotificationStatus
from app.models.User import User
from app.helpers.render import render_json
from app.instances.db import db

from flask import abort, g
from config import notifications


def get_notification_types():
    return NotificationType.to_json()

def get_notification_statuses():
    return NotificationStatus.to_json()

def get_unread_notification_count():
    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    Notification.query.filter_by(recipient_id=user_id)

def mark_notification_read(notification_id):
    """
    Marks a give notification as read.
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    Notification.query.\
        filter_by(recipient=g.user, id=notification_id).\
        update({'read': NotificationStatus.READ})

def mark_all_notifications_seen():
    """
    Marks all notifications as seen. Requires
    authorized user
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    Notification.query.\
        filter_by(recipient=g.user, read=NotificationStatus.UNSEEN).\
        update({'read': NotificationStatus.SEEN})

def mark_notifications_seen(notifications):
    """
    Marks a list of notification IDs as seen. Requires
    authorized user in session
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    Notification.query.filter(
        Notification.recipient == g.user,
        Notification.id.in_(notifications),
        Notification.read == NotificationStatus.UNSEEN
    ).update({'read': NotificationStatus.SEEN})
