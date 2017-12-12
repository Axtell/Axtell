import unittest

from app.start import server
from flask_testing import TestCase
from flask_sqlalchemy import SQLAlchemy
from config import db_config


class TestFlask(TestCase):
    SQLALCHEMY_DATABASE_URI = \
        f"mysql+mysqlconnector://" \
        f"{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/" \
        f"{db_config['database']}_test?charset=utf8mb4"

    PRESERVE_CONTEXT_ON_EXCEPTION = False

    def create_app(self):
        app = server
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = self.SQLALCHEMY_DATABASE_URI
        app.config['PRESERVE_CONTEXT_ON_EXCEPTION'] = self.PRESERVE_CONTEXT_ON_EXCEPTION
        return app

    def setUp(self):
        super().setUp()
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.db = SQLAlchemy(self.app)
        self.db.init_app(self.app)
        self.db.create_all()
        self.session = self.db.session()
        self.session.begin_nested()

    def tearDown(self):
        super().tearDown()
        self.session.rollback()
        self.db.session.remove()
        self.app_context.pop()
