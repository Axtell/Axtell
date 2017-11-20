from app.instances.db import db
from sqlalchemy.dialects.mysql import LONGTEXT
import datetime


class Post(db.Model):
    """
    Represnts a post (e.g. challenge)
    """

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    
    def to_json(self):
        data = {}
        data['title'] = self.title
        data['body'] = self.body
        data['owner'] = self.user.to_json()
        
        return data
    
    def __repr__(self):
        return '<Post(%r) by %r>' % (self.id, self.user.name)


def delayed_load():
    import app.models.User
    import app.models.Answer

    Post.title = db.Column(db.String(50), nullable=False)
    Post.body = db.Column(LONGTEXT, nullable=False)
    Post.date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    Post.user_id = db.Column(db.Integer, db.ForeignKey(app.models.User.User.id), nullable=False)
    Post.user = db.relationship(app.models.User.User, backref=db.backref('posts'))
    Post.answers = db.relationship(app.models.Answer.Answer, backref=db.backref('posts'))
