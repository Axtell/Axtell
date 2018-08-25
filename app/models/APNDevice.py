from app.instances import db
from app.helpers.SerializableEnum import SerializableEnum

from uuid import UUID
from M2Crypto.m2 import rand_bytes

class APNProvider(SerializableEnum):
    WEB_APN = 0

class APNDevice(db.Model):
    """
    An APN device to send Push Notifications to.
    """

    __tablename__ = 'apn_devices'
    __table_args__ = (
        db.UniqueConstraint('device_id', 'provider'),
        {'extend_existing': True}
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    uuid = db.Column(db.String(36), nullable=False, default=lambda: str(UUID(bytes=rand_bytes(16))))

    device_id = db.Column(db.String(64), nullable=True)
    provider = db.Column(db.Enum(APNProvider), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref='apn_devices', lazy=True)


    def __repr__(self):
        return "<APNDevice {} for {}>".format(self.device_id, self.provider.name)
