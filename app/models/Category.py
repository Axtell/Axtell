from app.instances.db import DBBase
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship


class Category(DBBase):
    """
    A category of a post.
    """

    __tablename__ = 'categories'
    
    name = Column(String(15), primary_key=True)
    posts = relationship('Post', secondary='post_categories', back_populates='categories', lazy='dynamic')
    
    def to_json(self):
        return {'name': self.name}
    
    def __repr__(self):
        return '<Tag \'{!r}\'>'.format(self.name)
