from app.instances.db import db
from app.helpers.macros.gravatar import gravatar


class User(db.Model):
    """
    Self-explanatory, a user.
    """

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)
    email = db.Column(db.String(320))

    posts = db.relationship('Post', backref='user')

    def avatar_url(self):
        return gravatar(self.email)

    def to_json(self, own=False):
        data = {
            'id': self.id,
            'name': self.name
        }

        if own:
            data['email'] = self.email

        return data

    def __repr__(self):
        return '<User({!r}) "{!r}">'.format(self.id, self.name)


class UserJWTToken(db.Model):
    """
    Represents an authentication scheme for a user based on a JWT-key style with
    an issuer and an identity. You **must** validate the key before inserting it
    here.
    """

    __tablename__ = 'user_jwt_tokens'

    identity = db.Column(db.String(255), primary_key=True)
    issuer = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('jwt_tokens', lazy=True))

    def __repr__(self):
        return '<UserToken for {!r}>'.format(self.user_id)
