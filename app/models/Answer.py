from app.instances.db import db
import datetime


class Answer(db.Model):
    """
    An answer posted to a post by a user.
    """

    __tablename__ = 'answers'

    id = db.Column(db.INTEGER, primary_key=True, autoincrement=True)
    post_id = db.Column(db.INTEGER, db.ForeignKey('posts.id'), nullable=False)
    code = db.Column(db.TEXT, default=db.null)
    commentary = db.Column(db.TEXT, default=db.null)
    user_id = db.Column(db.INTEGER, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DATETIME, default=datetime.datetime.utcnow)

    user = db.relationship('User', backref=db.backref('answers'))
    post = db.relationship('Post', backref=db.backref('answers'))

    def to_json(self):
        data = {}
        data['code'] = self.code
        data['owner'] = self.user.to_json()

        return data

    def __repr__(self):
        return '<Answer(%r) by %r>' % (self.id, self.user.name)
