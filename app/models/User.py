from app.instances.db import DBBase
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, backref


class User(DBBase):
    """
    Self-explanatory, a user.
    """

    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    name = Column(String(45), nullable=False)
    email = Column(String(320))

    posts = relationship('Post', backref='user')

    def to_json(self):
        return {'id': self.id, 'name': self.name, 'email': self.email}

    def __repr__(self):
        return '<User({!r}) "{!r}">'.format(self.id, self.name)


class UserJWTToken(DBBase):
    """
    Represents an authentication scheme for a user based on a JWT-key style with
    an issuer and an identity. You **must** validate the key before inserting it
    here.
    """

    __tablename__ = 'user_jwt_tokens'

    identity = Column(String(255), primary_key=True, nullable=False)
    issuer = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey(User.id), nullable=False)
    user = relationship(User, backref=backref('jwt_tokens', lazy=True))

    def __repr__(self):
        return '<UserToken for {!r}>'.format(self.user_id)
