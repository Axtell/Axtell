from app.instances.db import db

class Category(db.Model):
    """
    A category of a post.
    """
    
    name = db.Column(db.String(15), primary_key=True, unique=True)
    
    def to_json(self):
        return { name: self.name }
    
    def __repr__(self):
        return '<Tag \'{!r}\'>'.format(self.name)
