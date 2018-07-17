from app.instances.db import db
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.ext.hybrid import hybrid_property
from config import posts
from app.models.PostRevision import PostRevision
from app.helpers.macros.score import confidence
import datetime


class Post(db.Model):
    """
    Represnts a post (e.g. challenge)
    """

    __tablename__ = 'posts'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(posts['max_title']), nullable=False)
    body = db.Column(LONGTEXT, nullable=False)
    deleted = db.Column(db.Boolean, nullable=False, default=False)

    date_created = db.Column(db.DateTime, default=datetime.datetime.now)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    ppcg_id = db.Column(db.Integer, nullable=True)

    @hybrid_property
    def score(self):
        ups = self.votes.query.filter_by(vote=1).all()
        downs = self.votes.query.filter_by(vote=-1).all()
        return confidence(ups, downs)

    def to_json(self, no_body=False):
        json = {
            'id': self.id,
            'title': self.title,
            'owner': self.user.to_json(),
            'date_created': self.date_created.isoformat(),
            'deleted': self.deleted
        }

        if not no_body:
            json['body'] = self.body

        return json

    def revise(self, user, **new_post_data):
        revision = PostRevision(post_id=self.id,
                                title=self.title,
                                body=self.body,
                                deleted=self.deleted,
                                user_id=user.id)

        self.title = new_post_data.get('title', self.title)
        self.body = new_post_data.get('body', self.body)
        self.deleted = new_post_data.get('deleted', self.deleted)
        self.ppcg_id = new_post_data.get('ppcg_id', self.ppcg_id)

        return self, revision

    def __repr__(self):
        return '<Post(%r) by %r %s>' % (self.id, self.user.name, "(deleted)" if self.deleted else "")
