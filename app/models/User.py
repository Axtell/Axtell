from app.instances.db import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, unique=True, autoincrement=True)
    name = db.Column(db.String(45), nullable=False)
    auth_key = db.Column(db.String(45), nullable=False)
    email = db.Column(db.String(320))
    
    def __repr__(self):
        return '<User(%r) "%r">' % (self.id, self.name)
