from app.instances.db import db
from app.models.User import User
from app.models.Category import Category
from sqlalchemy.dialects.mysql import LONGTEXT
import datetime

categories = db.Table(
    db.Column('category_name', db.Integer, db.ForeignKey('category.name'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True)
)

class Post(db.Model):
    """
    Represnts a post (e.g. challenge)
    """
    
    __table_args__ = { 'extend_existing': True }
    
    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    title = db.Column(db.String(50), nullable=False)
    body = db.Column(LONGTEXT, nullable=False)
    
    
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), nullable=False)
    user = db.relationship(User, backref=db.backref('posts'))
    
    categories = db.relationship(Category, secondary=categories)
    
    def to_json(self):
        return {
            'title': self.title,
            'body': self.body,
            'owner': self.user.to_json()
        }
    
    def __repr__(self):
        return '<Post(%r) by %r>' % (self.id, self.user.name)
    
