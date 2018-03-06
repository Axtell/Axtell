from app.instances.db import db
import datetime


class PostComment(db.Model):

    __tablename__ = 'post_comments'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('post_comments.id'), nullable=True)
    text = db.Column(db.String(140), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    user = db.relationship('User', backref='post_comments')
    post = db.relationship('Post', backref='comments')
    parent = db.relationship('PostComment', backref='children', remote_side=[id])

    def to_json(self):
        data = {
            'text': self.text,
            'date': self.date_created,
            'owner': self.user.to_json(),
            'parent': self.parent,
            'children': self.children
        }

        return data

    def comment_tree(self, nest_depth=None):
        if len(self.children) == 0:
            return self
        if nest_depth is None:
            return [self, [child.comment_tree() for child in self.children]]
        else:
            if nest_depth > 1:
                return [self, [child.comment_tree(nest_depth-1) for child in self.children]]

    def __repr__(self):
        return '<PostComment(%r) by %r>' % (self.id, self.user.name)
