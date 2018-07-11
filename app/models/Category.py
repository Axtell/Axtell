from app.instances.db import db


class Category(db.Model):
    """
    A category of a post.
    """

    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(15), nullable=False)

    def to_json(self):
        return {'name': self.name}

    def __repr__(self):
        return '<Tag \'{!r}\'>'.format(self.name)
