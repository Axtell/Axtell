from app.instances.db import db
from app.notifications import apns
from app.models.Notification import Notification
from app.models.PushNotificationDevice import PNProvider

def send_notification(notification):
    """
    Sends a notification to database and also through
    all other mediums (e.g. websocket or notification)

    :param Notification notification: the notification
    """

    db.session.add(notification)
    db.session.commit()

    # Send to all Push Notification devices
    recipient = notification.recipient
    push_notification_devices = recipient.pn_devices

    for device in push_notification_devices:
        result = {
            PNProvider.WEB_APN:
                lambda: apns.send_notification(device=device, notification=notification)
        }[device.provider]()

