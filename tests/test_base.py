import unittest
import app.models
import app.start
import app.instances.db


class TestBase:
    class TestFlask(unittest.TestCase):
        def setUp(self):
            super().setUp()
            self.app = app.start.server.test_client()
            self.app.testing = True

    class TestDB(unittest.TestCase):
        def setUp(self):
            super().setUp()
            self.session = app.instances.db.db.session
            self.session.begin_nested()
            
        def tearDown(self):
            self.session.rollback()
