from app.instances.db import db
from app.models.PostCategories import categories


class Category(db.Model):
    """
    A category of a post.
    """

    __tablename__ = 'categories'
    
    name = db.Column(db.String(15), primary_key=True, unique=True)
    posts = db.relationship('Post', secondary=categories)
    
    def to_json(self):
        return {'name': self.name}
    
    def __repr__(self):
        return '<Tag \'{!r}\'>'.format(self.name)
