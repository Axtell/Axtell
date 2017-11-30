from app.instances.db import db
from app.models.PostCategories import categories
from sqlalchemy.dialects.mysql import LONGTEXT
from config import posts
import datetime


class Post(db.Model):
    """
    Represnts a post (e.g. challenge)
    """

    __tablename__ = 'posts'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    title = db.Column(db.String(posts['max_title']), nullable=False)
    body = db.Column(LONGTEXT, nullable=False)

    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    categories = db.relationship('Category', secondary=categories)

    def to_json(self):
        return {
            'title': self.title,
            'body': self.body,
            'owner': self.user.to_json()
        }
    
    def __repr__(self):
        return '<Post(%r) by %r>' % (self.id, self.user.name)
