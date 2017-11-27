from app.instances.db import db
import datetime
import app.models
from config import answers

class Answer(db.Model):
    """
    An answer posted to a post by a user.
    """

    id = db.Column(db.INTEGER, primary_key=True, autoincrement=True)
    post_id = db.Column(db.INTEGER, db.ForeignKey(app.models.Post.id), nullable=False)

    code = db.Column(db.TEXT, nullable=False)
    language_id = db.Column(db.String(answers['lang_len']), nullable=True)
    language_name = db.Column(db.String(answers['lang_len']), nullable=True)
    commentary = db.Column(db.TEXT, nullable=False)

    user_id = db.Column(db.INTEGER, db.ForeignKey(app.models.User.id), nullable=False)
    date_created = db.Column(db.DATETIME, default=datetime.datetime.utcnow)

    user = db.relationship(app.models.User, backref=db.backref('answers'))

    def to_json(self):
        data = {}

        data['code'] = self.code

        language = self.get_language()
        if language is not None:
            data['lang'] = language.to_json()

        data['commentary'] = self.commentary
        data['owner'] = self.user.to_json()

        return data

    def get_language(self):
        if self.language_id is None:
            return None

        return app.models.Language.Language(self.language_id)

    def __repr__(self):
        return '<Answer(%r) by %r>' % (self.id, self.user.name)
