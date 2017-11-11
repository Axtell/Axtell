from app.instances.db import db

class User(db.Model):
    """
    Self-explanatory, a user.
    """
    
    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)
    email = db.Column(db.String(320))
    
    def __repr__(self):
        return '<User(%r) "%r">' % (self.id, self.name)

class UserJWTToken(db.Model):
    
    """
    Represents an authentication scheme for a user based on a JWT-key style with
    an issuer and an identity. You **must** validate the key before inserting it
    here.
    """
    
    identity = db.Column(db.String(255), primary_key=True, nullable=False)
    issuer = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('jwt_tokens', lazy=True))
    
    def __repr__(self):
        return '<UserToken for %r>' % (self.user_id)
