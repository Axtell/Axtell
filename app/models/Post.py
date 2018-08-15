from app.instances.db import db
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import select, func
from config import posts
from app.helpers.macros.encode import slugify
from app.models.IndexStatus import IndexStatus
from app.models.PostRevision import PostRevision
from app.models.PostVote import PostVote
import datetime
from math import sqrt


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

    index_status = db.Column(db.Enum(IndexStatus), default=IndexStatus.UNINDEXED, nullable=False)

    ppcg_id = db.Column(db.Integer, nullable=True)

    def get_index_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'date_created': self.date_created.isoformat(),
            'score': self.score
        }

    @hybrid_property
    def score(self):
        ups = sum(vote for vote in self.votes if vote.vote == 1)
        downs = sum(vote for vote in self.votes if vote.vote == -1)

        n = ups + downs

        if n == 0:
            return 0

        z = 1.0
        phat = ups / n
        return (phat + z * z / (2 * n) - z * sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n)

    @score.expression
    def score(cls):
        ups = select([func.sum(PostVote.vote)]).where(PostVote.answer_id == cls.id
                                                      and PostVote.vote == 1).label('ups')
        downs = select([func.sum(PostVote.vote)]).where(PostVote.answer_id == cls.id
                                                        and PostVote.vote == -1).label('downs')

        n = ups + downs

        if n == 0:
            return 0

        z = 1.0
        phat = ups / n
        return (phat + z * z / (2 * n) - z * func.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n)

    def to_json(self, no_body=False):
        json = {
            'id': self.id,
            'title': self.title,
            'owner': self.user.to_json(),
            'slug': slugify(self.title),
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
