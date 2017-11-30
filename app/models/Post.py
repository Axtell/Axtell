from app.instances.db import DBBase
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.mysql import LONGTEXT
from config import posts
import datetime


class Post(DBBase):
    """
    Represnts a post (e.g. challenge)
    """

    __tablename__ = 'posts'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(posts['max_title']), nullable=False)
    body = Column(LONGTEXT, nullable=False)

    date_created = Column(DateTime, default=datetime.datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    categories = relationship('Category', secondary='post_categories', back_ref='posts', lazy='dynamic')

    def to_json(self):
        return {
            'title': self.title,
            'body': self.body,
            'owner': self.user.to_json()
        }
    
    def __repr__(self):
        return '<Post(%r) by %r>' % (self.id, self.user.name)
