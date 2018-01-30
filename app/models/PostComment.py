from app.instances.db import db
import datetime


class PostComment(db.Model):

    __tablename__ = 'post_comments'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    parent = db.Column(db.Integer, db.ForeignKey('post_comments.id'), nullable=True)
    text = db.Column(db.String(140), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    user = db.relationship('User', backref='post_comments')
    post = db.relationship('Post', backref='comments')

    def to_json(self):
        data = {
            'text': self.text,
            'date': self.date_created,
            'owner': self.user.to_json(),
            'parent': self.parent
        }

        return data

    def __repr__(self):
        return '<PostComment(%r) by %r>' % (self.id, self.user.name)