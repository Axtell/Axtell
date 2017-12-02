from app.instances.db import db
import datetime
from config import answers

class Answer(db.Model):
    """
    An answer posted to a post by a user.
    """

    __tablename__ = 'answers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)

    language_id = db.Column(db.String(answers['lang_len']), nullable=True)
    language_name = db.Column(db.String(answers['lang_len']), nullable=True)

    code = db.Column(db.Text, default=db.null)
    commentary = db.Column(db.Text, default=db.null)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    user = db.relationship('User', backref='answers')
    post = db.relationship('Post', backref='answers')

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
