from app.instances.db import db

class PushDevice(db.Model):
    """
    An APN device to send Push Notifications to.
    """

    __tablename__ = 'push_devices'

    id = db.Column(db.Integer, primary_key=True)

    endpoint = db.Column(db.String(400), nullable=False)
    auth = db.Column(db.String(24), nullable=False) # Maximum unencoded length is 16
    client_pub = db.Column(db.String(88), nullable=False) # Maximum unencoded length is 65

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref='push_devices', lazy=True)

    def __repr__(self):
        return "<PushDevice for {}>".format(self.user.name)
