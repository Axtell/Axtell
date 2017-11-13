from app.instances.db import db
from sqlalchemy.dialects.mysql import LONGTEXT

class Post(db.Model):
    """
    Represnts a post (e.g. challenge)
    """
    
    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    title = db.Column(db.String(50), nullable=False)
    body = db.Column(LONGTEXT, nullable=False)
    
    user_id = db.column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('posts'))
    
    tag_id = db.column(db.Integer, db.ForeignKey('tag.id', nullable=False))
    tag = db.relationship('PostTag', backref=db.backref('posts'))
    
    def to_json(self):
        data = {}
        data['title'] = self.title
        data['body'] = self.body
        data['owner'] = self.user.to_json()
        
        return data
    
    def __repr__(self):
        return '<Post(%r) by %r>' % (self.id, self.user.name)

    
    
