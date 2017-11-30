from app.instances.db import db


class Category(db.Model):
    """
    A category of a post.
    """

    __tablename__ = 'categories'
    
    name = db.Column(db.String(15), primary_key=True)
    
    def to_json(self):
        return {'name': self.name}
    
    def __repr__(self):
        return '<Tag \'{!r}\'>'.format(self.name)


post_categories = db.Table(
    'post_categories',
    db.metadata,
    db.Column('category_name', db.Integer, db.ForeignKey('categories.name'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True)
)
