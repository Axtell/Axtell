from app.instances.db import db

categories = db.Table(
    db.Column('category_name', db.Integer, db.ForeignKey('category.name'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True)
)
