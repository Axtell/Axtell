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
    paged_notifications = Notification.query.\
        filter_by(recipient_id=g.user.id).\
        order_by(Notification.date_created.desc()).\
        paginate(page, per_page=notifications['page_size'])

    return render_paginated(paged_notifications)

def mark_notification_status(notification_id, status):
    """
    Marks a give notification as read.
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    notifications = Notification.query.\
        filter_by(recipient_id=g.user.id, id=notification_id)

    notifications.update({'read': status})
    db.session.commit()

    return render_json({'status': status.value})

def mark_all_notifications_status(status):
    """
    Marks all notifications as seen. Requires
    authorized user
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    if status == NotificationStatus.SEEN:
        Notification.query.\
            filter_by(recipient=g.user, read=NotificationStatus.UNSEEN).\
            update({'read': status})
    else:
        Notification.query.\
            filter_by(recipient=g.user).\
            update({'read': status})

    db.session.commit()
    return render_json({'status': status.value})

def mark_notifications_status(notifications, status):
    """
    Marks a list of notification IDs as seen. Requires
    authorized user in session
    """

    if not isinstance(g.user, User):
        return render_error('Unauthorized'), 401

    if status == NotificationStatus.SEEN:
        # Basically we won't want "read" messages going to
        # "seen" state
        Notification.query.filter(
            Notification.recipient == g.user,
            Notification.id.in_(notifications),
            Notification.read == NotificationStatus.UNSEEN
        ).update({'read': NotificationStatus.SEEN}, synchronize_session=False)
    else:
        Notification.query.filter(
            Notification.recipient == g.user,
            Notification.id.in_(notifications)
        ).update({'read': status}, synchronize_session=False)

    db.session.commit()
    return render_json({'status': status.value})
