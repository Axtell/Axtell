from app.instances.db import DBBase
from sqlalchemy import Table, Column, Integer, ForeignKey

categories = Table(
    'post_categories',
    DBBase.metadata,
    Column('category_name', Integer, ForeignKey('categories.name'), primary_key=True),
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True)
)