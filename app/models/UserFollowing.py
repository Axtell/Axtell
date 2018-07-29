from app.instances.db import db
from app.models.User import User


UserFollowing = db.Table('user_following',
    db.Column('follower_id', db.Integer, db.ForeignKey(User.id)),
    db.Column('following_id', db.Integer, db.ForeignKey(User.id))
)


User.following = db.relationship(
    User,
    secondary=UserFollowing,
    primaryjoin=(UserFollowing.c.follower_id == User.id),
    secondaryjoin=(UserFollowing.c.following_id == User.id),
    backref=db.backref('followers', lazy='dynamic'),
    lazy='dynamic'
)
