from app.instances.db import db
from sqlalchemy.dialects.mysql import TINYINT


class AnswerVote(db.Model):
    __tablename__ = 'answer_votes'
    __table_args__ = {'extend_existing': True}

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id'), nullable=False)
    vote = db.Column(TINYINT, default=0)

    user = db.relationship('User', backref='votes')
    answer = db.relationship('Answer', backref='votes')

    def to_json(self):
        data = {}

        data['vote'] = self.vote
        data['user'] = self.user_id
        data['answer'] = self.answer_id

        return data

    def __repr__(self):
        return '<AnswerVote(%+d) on (%r) by (%r)>' % (self.vote, self.answer, self.user)
