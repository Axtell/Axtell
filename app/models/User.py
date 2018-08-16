from app.instances.db import db
from app.helpers.macros.gravatar import gravatar
from app.helpers.search_index import index_json, IndexStatus, gets_index

import config


class User(db.Model):
    """
    Self-explanatory, a user.
    """

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(config.users['max_name_len']), nullable=False)
    email = db.Column(db.String(320))
    avatar = db.Column(db.String(256), nullable=True)

    posts = db.relationship('Post', backref='user')
    theme = db.Column(db.Integer, db.ForeignKey('themes.id'), nullable=True)

    index_status = db.Column(db.Enum(IndexStatus), default=IndexStatus.UNINDEXED, nullable=False)

    following_public = db.Column(db.Boolean, nullable=False, default=False)

    @index_json
    def get_index_json(self):
        return {
            'objectID': f'user-{self.id}',
            'id': self.id,
            'name': self.name
        }

    @gets_index
    def get_index():
        return 'users'

    def follow(self, user):
        """
        Makes (self) User follow the given user. You can't follow yourself

        :param User user: The user which this instance _will_ follow
        """
        if not user.followed_by(self) and user.id != self.id:
            self.following.append(user)

    def unfollow(self, user):
        """
        Makes (self) User not follow the given user.

        :param User user: The user which this instance _will not_ follow
        """

        if user.followed_by(self):
            self.following.remove(user)

    def followed_by(self, user):
        """
        Checks if a provided user follows the user referenced by `self`

        :param User user: The user which will be checked if following
        :return: boolean indicating
        """
        return self.followers.filter_by(id=user.id).scalar() is not None

    def avatar_url(self):
        if self.avatar is not None:
            return self.avatar
        else:
            return gravatar(self.email)

    def to_json(self, current_user=None, own=False, bio=False):
        data = {
            'id': self.id,
            'name': self.name,
            'avatar': self.avatar_url()
        }

        if current_user is not None:
            data['is_following'] = self.followed_by(current_user)

        if own:
            data['email'] = self.email

        if bio:
            data['post_count'] = len(self.posts)
            data['answer_count'] = len(self.answers)

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
