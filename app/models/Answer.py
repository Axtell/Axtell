from app.instances.db import DBBase
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, null
from sqlalchemy.orm import relationship, backref
import datetime


class Answer(DBBase):
    """
    An answer posted to a post by a user.
    """

    __tablename__ = 'answers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(Integer, ForeignKey('posts.id'), nullable=False)
    code = Column(Text, default=null)
    commentary = Column(Text, default=null)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    date_created = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship('User', backref=backref('answers'))
    post = relationship('Post', backref=backref('answers'))

    def to_json(self):
        data = {}
        data['code'] = self.code
        data['owner'] = self.user.to_json()

        return data

    def __repr__(self):
        return '<Answer(%r) by %r>' % (self.id, self.user.name)
