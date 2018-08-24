from app.instances import db
import datetime


class Login(db.Model):
    """
    Represents a login by a user (either creating a new session, or refreshing a stale session)
    """

    __tablename__ = 'logins'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    time = db.Column(db.DateTime, default=datetime.datetime.now)
    ip_address = db.Column(db.String(40), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    user = db.relationship('User', backref='logins', order_by='desc(Login.time)', lazy=True)

    def to_json(self):
        return {
            'id': self.id,
            'time': self.time,
            'ip_address': self.ip_address,
            'user_id': self.user_id
        }

    def __repr__(self):
        return "<Login by {} ({}) at {}>".format(self.user_id or 'anonymous user', self.ip_address, self.time)
