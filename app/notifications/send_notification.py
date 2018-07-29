from app.instances.db import db
from app.models.Notification import Notification

def send_notification(notification):
    """
    Sends a notification to database and also through
    all other mediums (e.g. websocket or notification)

    :param Notification notification: the notification
    """

    db.session.add(notification)
    db.session.commit()
