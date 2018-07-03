from app.instances.db import db
import datetime
from time import mktime
from config import comments


class AnswerComment(db.Model):

    __tablename__ = 'answer_comments'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    answer_id = db.Column(db.Integer, db.ForeignKey('answers.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('answer_comments.id'), nullable=True)
    text = db.Column(db.String(comments['max_len']), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.now)

    user = db.relationship('User', backref='answer_comments')
    answer = db.relationship('Answer', backref='comments')
    parent = db.relationship('AnswerComment', backref='children', remote_side=[id])

    def to_json(self, show_children=True, show_parent=False):
        data = {
            'id': self.id,
            'ty': 'answer',
            'source_id': self.answer_id,
            'text': self.text,
            'date': self.date_created.isoformat(),
            'owner': self.user.to_json(),
            'parent': self.parent and show_parent and self.parent.to_json(show_children=show_children),
            'children': show_children and [child.to_json(show_parent=show_parent) for child in self.children]
        }

        return data

    def comment_tree(self, nest_depth=None):
        if len(self.children) == 0:
            return self
        if nest_depth is None:
            return [self, [child.comment_tree() for child in self.children]]
        else:
            if nest_depth > 1:
                return [self, [child.comment_tree(nest_depth-1) for child in self.children]]

    def __repr__(self):
        return '<AnswerComment(%r) by %r>' % (self.id, self.user.name)
