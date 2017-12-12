import unittest

from app.start import server
from flask_testing import TestCase
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import db_config


class TestBase:
    class TestFlask(TestCase):
        SQLALCHEMY_DATABASE_URI = \
            f"mysql+mysqlconnector://" \
            f"{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/" \
            f"{db_config['database']}_test?charset=utf8mb4"

        def create_app(self):
            app = Flask("PPCGv2 Test")
            app.config['TESTING'] = True
            app.config['SQLALCHEMY_DATABASE_URI'] = self.SQLALCHEMY_DATABASE_URI
            self.db = SQLAlchemy(server)
            with app.test_context():
                self.db.init_app(app)
            return app

        def setUp(self):
            super().setUp()
            self.db.create_all()

        def tearDown(self):
            super().tearDown()
            self.db.session.remove()
            self.db.drop_all()

    class TestDB(TestFlask):
        def setUp(self):
            super().setUp()
            self.session = self.db.session
            self.session.begin_nested()

        def tearDown(self):
            self.session.rollback()
