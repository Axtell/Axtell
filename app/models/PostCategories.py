from app.instances.db import db

db.Table(
    'post_categories',
    db.metadata,
    db.Column('category_name', db.Integer, db.ForeignKey('categories.name'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True)
)
