from app.instances.db import db
import datetime


class Answer(db.Model):
    """
    An answer posted to a post by a user.
    """

    id = db.Column(db.INTEGER, primary_key=True, autoincrement=True)

    def to_json(self):
        data = {}
        data['code'] = self.code
        data['owner'] = self.user.to_json()

        return data

    def __repr__(self):
        return '<Answer(%r) by %r>' % (self.id, self.user.name)


def delayed_load():
    import app.models.Post

    Answer.post_id = db.Column(db.INTEGER, db.ForeignKey(app.models.Post.Post.id), nullable=False)
    Answer.code = db.Column(db.TEXT, default=db.null)
    Answer.commentary = db.Column(db.TEXT, default=db.null)
    Answer.user_id = db.Column(db.INTEGER, db.ForeignKey(app.models.User.User.id), nullable=False)
    Answer.date_created = db.Column(db.DATETIME, default=datetime.datetime.utcnow)

    Answer.user = db.relationship(app.models.User.User, backref=db.backref('answers'))
