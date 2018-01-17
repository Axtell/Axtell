from app.instances.db import db
import datetime


class AnswerComment(db.Model):

    __tablename__ = 'answer_comments'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id'), nullable=False)
    text = db.Column(db.String(140), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    user = db.relationship('User', backref='post_comments')
    answer = db.relationship('Answer', backref='comments')

    def to_json(self):
        data = {
            'text': self.text,
            'date': self.date_created,
            'owner': self.user.to_json()
        }

        return data

    def __repr__(self):
        return '<AnswerComment(%r) by %r>' % (self.id, self.user.name)
