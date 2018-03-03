from app.instances.db import db
from app.helpers.macros.gravatar import gravatar

import config


class User(db.Model):
    """
    Self-explanatory, a user.
    """

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(config.users['max_name_len']), nullable=False)
    email = db.Column(db.String(320))
    avatar = db.Column(db.String(64), nullable=True)

    posts = db.relationship('Post', backref='user')
    theme = db.Column(db.Integer, db.ForeignKey('themes.id'), nullable=False, default=0)

    def avatar_url(self):
        if self.avatar is not None:
            return self.avatar
        else:
            return gravatar(self.email)

    def to_json(self, own=False):
        data = {
            'id': self.id,
            'name': self.name,
            'avatar': self.avatar_url()
        }

        if own:
            data['email'] = self.email

        return data

    def __repr__(self):
        return '<User({!r}) "{!r}">'.format(self.id, self.name)


class UserOAuthToken(db.Model):
    """
    Represents an OAuth login token based on an ID the OAuth provider can provide
    which uniquely identifies the user, along with a unique id.
    """

    __tablename__ = 'user_oauth_token'

    provider_id = db.Column(db.String(15), primary_key=True, nullable=False)
    identity = db.Column(db.String(255), primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('oauth_tokens', lazy=True))


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
