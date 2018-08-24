from app.instances import db
from config import posts
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import backref
import datetime


def get_revision_id(context):
    post_id = context.get_current_parameters()['post_id']
    try:
        return (PostRevision.query
                .filter_by(post_id=post_id)
                .order_by(PostRevision.revision_id.desc())
                .first().revision_id) + 1
    except AttributeError:
        return 1


class PostRevision(db.Model):
    """
    A prior revision of a post
    """

    __tablename__ = 'post_revision'

    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), primary_key=True)
    revision_id = db.Column(db.Integer, primary_key=True, default=get_revision_id)

    title = db.Column(db.String(posts['max_title']), nullable=False)
    body = db.Column(LONGTEXT, nullable=False)
    deleted = db.Column(db.Boolean, nullable=False, default=False)

    revision_time = db.Column(db.DateTime, default=datetime.datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', backref='post_revisions', lazy=True)
    post = db.relationship('Post', backref=backref('post_revisions', order_by=revision_id), lazy=True)

    def to_json(self):
        return {
            'post_id': self.post_id,
            'revision_id': self.revision_id,
            'title': self.title,
            'body': self.body,
            'deleted': self.deleted,
            'revision_time': self.revision_time,
            'user_id': self.user_id
        }

    def __repr__(self):
        return repr(self.to_json())
