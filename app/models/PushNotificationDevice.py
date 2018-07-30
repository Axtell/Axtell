from app.instances.db import db
from app.helpers.SerializableEnum import SerializableEnum

from uuid import UUID
from M2Crypto.m2 import rand_bytes

class PNProvider(SerializableEnum):
    WEB_APN = 0

class PushNotificationDevice(db.Model):
    """
    A device to send Push Notifications to.
    """

    __tablename__ = 'push_notification_devices'
    __table_args__ = (
        db.UniqueConstraint('device_id', 'provider'),
        {'extend_existing': True}
    )

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(UUID(bytes=rand_bytes(16))))

    device_id = db.Column(db.String(36), nullable=True)
    provider = db.Column(db.Enum(PNProvider), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref='pn_devices', lazy=True)


    def __repr__(self):
        return "<PushNotificationDevice {} for {}>".format(self.device_id, self.provider.name)
