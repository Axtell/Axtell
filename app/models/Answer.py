from app.instances import db
from sqlalchemy import select, func
from sqlalchemy.ext.hybrid import hybrid_property
from app.helpers.macros.encode import slugify
import app.models.Language
from app.models.AnswerVote import AnswerVote
from app.models.AnswerRevision import AnswerRevision
from app.helpers.search_index import index_json, IndexStatus, gets_index
import datetime
from math import sqrt
from config import answers

import golflang_encodings


class Answer(db.Model):
    """
    An answer posted to a post by a user.
    """

    __tablename__ = 'answers'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)

    language_id = db.Column(db.String(answers['lang_len']), nullable=True, default=None)
    language_name = db.Column(db.String(answers['lang_len']), nullable=True, default=None)

    code = db.Column(db.Text, default=None, nullable=True)
    commentary = db.Column(db.Text, default=None, nullable=True)
    encoding = db.Column(db.String(30), default='UTF-8')
    deleted = db.Column(db.Boolean, nullable=False, default=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.now)

    index_status = db.Column(db.Enum(IndexStatus), default=IndexStatus.UNSYNCHRONIZED, nullable=False)

    user = db.relationship('User', backref='answers')
    post = db.relationship('Post', backref='answers', lazy=True)

    @index_json
    def get_index_json(self):
        last_revision = AnswerRevision.query.filter_by(answer_id=self.id).order_by(AnswerRevision.revision_time.desc()).first()
        if isinstance(last_revision, AnswerRevision):
            last_modified = last_revision.revision_time
        else:
            last_modified = self.date_created

        language = self.get_language()

        return {
            'objectID': f'answer-{self.id}',
            'id': self.id,
            'code': self.code,
            'date_created': self.date_created.isoformat(),
            'last_modified': last_modified.isoformat(),
            'language': language.get_id(),
            'language_name': language.get_display_name(),
            'byte_count': self.byte_len,
            'author': self.user.get_index_json(root_object=False),
            'post': {
                'id': self.post.id,
                'name': self.post.title,
                'slug': slugify(self.post.title)
            }
        }

    def should_index(self):
        return not self.deleted

    @classmethod
    @gets_index
    def get_index(cls):
        return 'answers'

    @classmethod
    def get_index_settings(cls):
        return {
            'searchableAttributes': [
                'code',
                'language_name',
                'author.name',
                'post.name'
            ],
            'attributesToSnippet': [
                'code',
                'language_name',
                'author.name',
                'post.name'
            ]
        }

    @hybrid_property
    def byte_len(self):
        return len(self.code.encode(self.encoding or 'utf8'))

    @byte_len.expression
    def byte_len(cls):
        return func.length(cls.code)

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
        ups = select([func.sum(AnswerVote.vote)]).where(AnswerVote.answer_id == cls.id
                                                        and AnswerVote.vote == 1).label('ups')
        downs = select([func.sum(AnswerVote.vote)]).where(AnswerVote.answer_id == cls.id
                                                          and AnswerVote.vote == -1).label('downs')

        n = ups + downs

        if n == 0:
            return 0

        z = 1.0
        phat = ups / n
        return (phat + z * z / (2 * n) - z * func.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n)

    def to_json(self, no_code=False):
        data = {}

        if not no_code:
            data['code'] = self.code
            data['commentary'] = self.commentary

        data['id'] = self.id
        data['encoding'] = self.encoding
        data['byte_len'] = self.byte_len

        language = self.get_language()
        if language is not None:
            data['lang'] = language.to_json()

        data['owner'] = self.user.to_json()

        data['date_created'] = self.date_created.isoformat()

        data['deleted'] = self.deleted

        return data

    def get_language(self):
        if self.language_id is None:
            return None

        return app.models.Language.Language(self.language_id)

    def revise(self, user, **new_answer_data):
        revision = AnswerRevision(answer_id=self.id,
                                  language_id=self.language_id,
                                  language_name=self.language_name,
                                  code=self.code,
                                  commentary=self.commentary,
                                  encoding=self.encoding,
                                  deleted=self.deleted,
                                  user_id=user.id)

        if 'code' in new_answer_data:
            self.code = new_answer_data['code']

        if 'commentary' in new_answer_data:
            self.commentary = new_answer_data['commentary']

        if 'encoding' in new_answer_data:
            self.encoding = new_answer_data['encoding']

        if 'deleted' in new_answer_data:
            self.deleted = new_answer_data['deleted']

        return self, revision

    def __repr__(self):
        return '<Answer(%r) by %r %s>' % (self.id, self.user.name, "(deleted)" if self.deleted else "")
