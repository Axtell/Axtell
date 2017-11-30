from app.instances.db import DBBase
from sqlalchemy import Column, Integer, ForeignKey

categories = DBBase.Table(
    Column('category_name', Integer, ForeignKey('categories.name'), primary_key=True),
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True)
)
