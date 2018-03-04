import app.start
import app.instances.db
from app.models.Theme import Theme
from flask_testing import TestCase


class TestFlask(TestCase):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.db = app.instances.db.db
        self.db.create_all()

    def create_app(self):
        _app = app.start.server
        _app.config['TESTING'] = True
        _app.config['DEBUG'] = True
        _app.config['PRESERVE_CONTEXT_ON_EXCEPTION'] = False
        _app.config['SERVER_NAME'] = 'localhost'
        return _app

    def setUp(self):
        super().setUp()
        self.ctx = self.app.app_context()
        self.ctx.push()
        self.session = self.db.session
        self.session.begin_nested()

    def tearDown(self):
        super().tearDown()
        self.session.rollback()
        self.ctx.pop()

    def assert302(self, response, message=None):
        return self.assertStatus(response.status_code, 302, message)
