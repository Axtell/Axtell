from app.instances.db import db
from app.models.Post import Post
from app.models.User import User
import datetime


class Answer(db.Model):
    """
    An answer posted to a post by a user.
    """

    id = db.Column(db.INTEGER, primary_key=True, autoincrement=True)
    post_id = db.Column(db.INTEGER, db.ForeignKey(Post.id), nullable=False)
    code = db.Column(db.TEXT, default=db.null)
    commentary = db.Column(db.TEXT, default=db.null)
    user_id = db.Column(db.INTEGER, db.ForeignKey(User.id), nullable=False)
    date_created = db.Column(db.DATETIME, default=datetime.datetime.utcnow)

    user = db.relationship(User, backref=db.backref('answers'))

    def to_json(self):
        data = {}
        data['code'] = self.code
        data['owner'] = self.user.to_json()

        return data

    def __repr__(self):
        return '<Answer(%r) by %r>' % (self.id, self.user.name)
