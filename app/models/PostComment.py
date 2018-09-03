from app.instances import db
import datetime
from config import comments


class PostComment(db.Model):

    __tablename__ = 'post_comments'
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('post_comments.id'), nullable=True)
    text = db.Column(db.String(comments['max_len']), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    deleted = db.Column(db.Boolean, default=False, nullable=False)

    user = db.relationship('User', backref='post_comments')
    post = db.relationship('Post', backref='comments')
    parent = db.relationship('PostComment', backref='children', remote_side=[id])

    def to_json(self, show_children=True, show_parent=False):
        data = {
            'id': self.id,
            'ty': 'post',
            'source_id': self.post_id,
            'text': self.text,
            'date': self.date_created.isoformat(),
            'owner': self.user.to_json(),
            'parent': self.parent and show_parent and self.parent.to_json(show_children=show_children),
            'children': show_children and [child.to_json(show_parent=show_parent) for child in self.children],
            'deleted': self.deleted
        }

        return data

    def comment_tree(self, nest_depth=None):
        if len(self.children) == 0:
            return self
        if nest_depth is None:
            return [self, [child.comment_tree() for child in self.children if child.deleted is False]]
        else:
            if nest_depth > 1:
                return [self, [child.comment_tree(nest_depth-1) for child in self.children if child.deleted is False]]

    def __repr__(self):
        return '<PostComment(%r) by %r>' % (self.id, self.user.name)
