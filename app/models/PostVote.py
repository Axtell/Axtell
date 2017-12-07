from app.instances.db import db
from sqlalchemy.dialects.mysql import TINYINT


class PostVote(db.Model):
    __tablename__ = 'post_votes'
    __table_args__ = {'extend_existing': True}

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), primary_key=True)
    vote = db.Column(TINYINT, default=0)

    user = db.relationship('User', backref='votes')
    post = db.relationship('Post', backref='votes')

    def to_json(self):
        data = {}

        data['vote'] = self.vote
        data['user'] = self.user_id
        data['post'] = self.post_id

        return data

    def __repr__(self):
        return '<PostVote(%+d) on (%r) by (%r)>' % (self.vote, self.post, self.user)
