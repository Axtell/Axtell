from app.instances import db
from config import answers
from sqlalchemy.orm import backref
import datetime


def get_revision_id(context):
    answer_id = context.get_current_parameters()['answer_id']
    try:
        return (AnswerRevision.query
                .filter_by(answer_id=answer_id)
                .order_by(AnswerRevision.revision_id.desc())
                .first().revision_id) + 1
    except AttributeError:
        return 1


class AnswerRevision(db.Model):
    """
    A prior revision of a post
    """

    __tablename__ = 'answer_revision'

    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    revision_id = db.Column(db.Integer, primary_key=True, default=get_revision_id)

    language_id = db.Column(db.String(answers['lang_len']), nullable=True, default=None)
    language_name = db.Column(db.String(answers['lang_len']), nullable=True, default=None)

    code = db.Column(db.Text, default=None, nullable=True)
    commentary = db.Column(db.Text, default=None, nullable=True)
    encoding = db.Column(db.String(10), default='utf8')
    deleted = db.Column(db.Boolean, nullable=False, default=False)

    revision_time = db.Column(db.DateTime, default=datetime.datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', backref='answer_revisions', lazy=True)
    answer = db.relationship('Answer', backref=backref('answer_revisions', order_by=revision_id), lazy=True)

    def to_json(self):
        return {
            'answer_id': self.answer_id,
            'revision_id': self.revision_id,
            'language_id': self.language_id,
            'language_name': self.language_name,
            'code': self.code,
            'commentary': self.commentary,
            'encoding': self.encoding,
            'deleted': self.deleted,
            'revision_time': self.revision_time,
            'user_id': self.user_id
        }

    def __repr__(self):
        return repr(self.to_json())
