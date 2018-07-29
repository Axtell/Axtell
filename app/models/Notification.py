from app.instances.db import db
from app.helpers.SerializableEnum import SerializableEnum
import datetime

class NotificationType(SerializableEnum):
    STATUS_UPDATE = 0
    NEW_ANSWER = 1
    OUTGOLFED = 2
    NEW_POST_COMMENT = 3
    NEW_ANSWER_COMMENT = 4
    ANSWER_VOTE = 5
    POST_VOTE = 6

class NotificationStatus(SerializableEnum):
    UNSEEN = 0
    SEEN = 1
    READ = 2

class Notification(db.Model):
    """
    Represents a notification sent to a user
    """

    __tablename__ = 'notifications'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient = db.relationship('User', backref='notifications', lazy=True)

    # The type of notification see the NotificationType enum class
    notification_type = db.Column(db.Enum(NotificationType), nullable=False)

    # An ID referencing the item which dispatches the notification
    target_id = db.Column(db.Integer, nullable=True)

    date_created = db.Column(db.DateTime, default=datetime.datetime.now)

    read = db.Column(db.Enum(NotificationStatus), default=NotificationStatus.UNSEEN)


    def to_json(self):
        return {
            'id': self.id,
            'recipient': self.user.to_json(),
            'type': self.notification_type.value,
            'user_id': self.user_id
        }

    def __repr__(self):
        return "<Login by {} ({}) at {}>".format(self.user_id or 'anonymous user', self.ip_address, self.time)
