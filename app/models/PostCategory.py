from app.instances.db import db
from app.models.Post import Post
from app.models.Category import Category

PostCategory = db.Table(
    'post_categories',
    db.metadata,
    db.Column('category_name', db.String(15), db.ForeignKey(Category.name), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey(Post.id), primary_key=True)
)

Post.categories = db.relationship('Category', secondary=PostCategory, backref='posts', lazy='dynamic')
