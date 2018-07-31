from app.models.Notification import Notification, NotificationType, NotificationStatus
from app.models.User import User
from app.helpers.render import render_json, render_paginated
from app.instances.db import db

from flask import abort, g
from config import notifications


def get_notification_types():
    return NotificationType.to_json()

def get_notification_statuses():
    return NotificationStatus.to_json()

def get_unseen_notification_count():
    unread_count = Notification.query.\
        filter_by(recipient_id=g.user.id, read=NotificationStatus.UNSEEN).\
        count()

    return unread_count

def get_notification_page(page):
    notifications = Notification.query.\
        filter_by(recipient_id=g.user.id).\
        order_by(Notification.date_created.asc()).\
        paginate(page, per_page=notifications['page_size'])

    return render_paginated(notifications)

def mark_notification_read(notification_id):
    """
    Marks a give notification as read.
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    notifications = Notification.query.\
        filter_by(recipient_id=g.user.id, id=notification_id)

    notifications.update({'read': NotificationStatus.READ})
    db.session.commit()

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
    db.session.commit()

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
    db.session.commit()
