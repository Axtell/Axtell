from app.instances import db
from app.helpers.macros.gravatar import gravatar
from app.helpers.search_index import index_json, IndexStatus, gets_index
from app.helpers.SerializableEnum import SerializableEnum
from app.models.Login import Login

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

    index_status = db.Column(db.Enum(IndexStatus), default=IndexStatus.UNSYNCHRONIZED, nullable=False)

    following_public = db.Column(db.Boolean, nullable=False, default=True)
    linked_stackexchange_public = db.Column(db.Boolean, nullable=False, default=False)

    is_admin = db.Column(db.Boolean, nullable=False, default=False)

    @index_json
    def get_index_json(self):
        return {
            'objectID': f'user-{self.id}',
            'id': self.id,
            'name': self.name,
            'avatar': self.avatar_url()
        }

    def should_index(self):
        return True

    @classmethod
    @gets_index
    def get_index(cls):
        return 'users'

    @classmethod
    def get_index_settings(cls):
        return {
            'searchableAttributes': [
                'name'
            ],
            'attributesToSnippet': [
                'name'
            ]
        }

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


class AuthTokenType(SerializableEnum):
    OAUTH = 0
    JWT = 1


class UserAuthToken(db.Model):
    """
    Represents an authentication scheme for a user based on a JWT-key or OAuth
    style with an issuer and an identity. You **must** validate the key before
    inserting it here.
    """

    __tablename__ = 'user_auth_tokens'

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)

    # Auth method type
    auth_method = db.Column(db.Enum(AuthTokenType), nullable=False)

    # Who gives identity and who they are said to be
    identity = db.Column(db.String(255), nullable=False)
    issuer = db.Column(db.String(255), nullable=False)

    # User-facing identifier
    identifier = db.Column(db.String(255), nullable=False)

    # Connects to Axtell user
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('auth_tokens', lazy=True))


    def to_json(self):
        # Get the time of most recent login
        latest_login = next(iter(self.logins), None)
        latest_login_time = latest_login and latest_login.time.isoformat()

        return {
            'id': self.id,
            'method': self.auth_method.value,
            'issuer': self.issuer,
            'last_used': latest_login_time,
            'identifier': self.identifier
        }


    def __repr__(self):
        return f'<UserToken for {self.user}>'
