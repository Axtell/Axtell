from app.start import server
from app.instances.db import db
from flask_testing import TestCase


class TestFlask(TestCase):

    def create_app(self):
        app = server
        app.config['TESTING'] = True
        return app

    def setUp(self):
        super().setUp()
        self.db = db
        self.db.create_all()
        self.session = self.db.session
        self.session.begin_nested()

    def tearDown(self):
        super().tearDown()
        self.session.rollback()
