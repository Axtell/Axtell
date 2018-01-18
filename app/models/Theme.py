from app.instances.db import db


class Theme(db.Model):
    """
    A theme for the web view
    """

    __tablename__ = "themes"
    __table_args__ = {'extend_existing': True}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
