from app.instances.db import db
import app.models.Post as Post
import app.models.User as User
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
    post_time = db.Column(db.DATETIME, default=datetime.datetime.utcnow)

    def to_json(self):
        data = {}
        data['code'] = self.code
        data['owner'] = self.user.to_json()

        return data

    def __repr__(self):
        return '<Answer(%r) by %r>' % (self.id, self.user.name)
