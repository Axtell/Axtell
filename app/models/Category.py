from app.instances.db import db

categories = db.Table(
    db.Column('category_name', db.Integer, db.ForeignKey('category.name'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True)
)

class Category(db.Model):
    """
    A category of a post.
    """
    
    name = db.Column(db.String(15), primary_key=True, unique=True)
    posts = db.relationship('post', secondary=categories)
    
    def to_json(self):
        return { name: self.name }
    
    def __repr__(self):
        return '<Tag \'{!r}\'>'.format(self.name)
