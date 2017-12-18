from app.start import server
from app.instances.db import db
from flask_testing import TestCase


class TestFlask(TestCase):

    def create_app(self):
        app = server
        app.config['TESTING'] = True
        app.config['PRESERVE_CONTEXT_ON_EXCEPTION'] = False
        app.config['SERVER_NAME'] = 'localhost'
        return app

    def setUp(self):
        super().setUp()
        self.ctx = self.app.app_context()
        self.ctx.push()
        self.db = db
        self.session = self.db.session
        self.session.begin_nested()

    def tearDown(self):
        super().tearDown()
        self.session.rollback()
        self.ctx.pop()
