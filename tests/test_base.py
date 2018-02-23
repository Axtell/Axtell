import app.start
import app.instances.db
from app.models.Theme import Theme
from flask_testing import TestCase


class TestFlask(TestCase):

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
        self.db = app.instances.db.db
        self.session = self.db.session
        self.session.begin_nested()
        
        self.session.begin_nested()
        light_theme = Theme(name='light')
        self.session.add(light_theme)
        dark_theme = Theme(name='dark')
        self.session.add(dark_theme)
        try:
            self.session.commit()
        except:
            self.session.rollback()

    def tearDown(self):
        super().tearDown()
        self.session.rollback()
        self.ctx.pop()

    def assert302(self, response, message=None):
        return self.assertStatus(response.status_code, 302, message)
