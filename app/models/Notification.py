from app.instances.db import db
from app.helpers.SerializableEnum import SerializableEnum
from uuid import UUID
from M2Crypto.m2 import rand_bytes
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

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(UUID(bytes=rand_bytes(16))))

    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipient = db.relationship('User', backref='notifications', lazy=True)

    # The type of notification see the NotificationType enum class
    notification_type = db.Column(db.Enum(NotificationType), nullable=False)

    # An ID referencing the item which dispatches the notification
    target_id = db.Column(db.Integer, nullable=True)

    date_created = db.Column(db.DateTime, default=datetime.datetime.now)

    read = db.Column(db.Enum(NotificationStatus), default=NotificationStatus.UNSEEN)


    def get_target_descriptor(self):
        """
        Returns the 'category' of the type's associated
        payload. This is used in the responder router
        """
        return {
            NotificationType.STATUS_UPDATE: 'status',
            NotificationType.NEW_ANSWER: 'answer',
            NotificationType.OUTGOLFED: 'answer',
            NotificationType.NEW_POST_COMMENT: 'post_comment',
            NotificationType.NEW_ANSWER_COMMENT: 'answer_comment',
            NotificationType.ANSWER_VOTE: 'answer',
            NotificationType.POST_VOTE: 'answer'
        }[self.notification_type]

    def get_title(self):
        # TODO: more descriptive titles
        return {
            NotificationType.STATUS_UPDATE: lambda: "Status Update",
            NotificationType.NEW_ANSWER: lambda: "New answer posted.",
            NotificationType.OUTGOLFED: lambda: "You've been outgolfed",
            NotificationType.NEW_POST_COMMENT: lambda: "New reply to your post",
            NotificationType.NEW_ANSWER_COMMENT: lambda: "New reply to your answer",
            NotificationType.ANSWER_VOTE: lambda: "Someone voted on your answer",
            NotificationType.POST_VOTE: lambda: "Someone voted on your post"
        }[self.notification_type]()

    def get_body(self):
        # TODO: more descriptive bodies
        return {
            NotificationType.STATUS_UPDATE: lambda: "You're received a brand new status update",
            NotificationType.NEW_ANSWER: lambda: "A new answer has been posted to a challenge of yours.",
            NotificationType.OUTGOLFED: lambda: "One of your answers has been outgolfed!",
            NotificationType.NEW_POST_COMMENT: lambda: "A new comment has been posted on your challenge",
            NotificationType.NEW_ANSWER_COMMENT: lambda: "A new comment has been posted on your answer",
            NotificationType.ANSWER_VOTE: lambda: "A new vote has come upon your answer.",
            NotificationType.POST_VOTE: lambda: "A new vote has come upon your challenge."
        }[self.notification_type]()

    def to_apns_json(self):
        """
        Returns APNS compliant JSON payload
        """
        target = str(self.target_id) if self.target_id is not None else '_'

        return {
            'aps': {
                'alert': {
                    'title': self.get_title(),
                    'body': self.get_body(),
                    'action': 'View'
                },
                'url-args': [self.id, self.get_target_descriptor(), target]
            }
        }

    def to_json(self):
        return {
            'id': self.id,
            'recipient': self.user.to_json(),
            'type': self.notification_type.value,
            'user_id': self.user_id
        }

    def __repr__(self):
        return "<Notification about {} for {}>".format(self.notification_type.name, self.recipient.name)
