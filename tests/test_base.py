import unittest
from app.start import server, db

class TestBase:
    class TestFlask(unittest.TestCase):
        def setUp(self):
            super().setUp()
            self.app = server.test_client()
            self.app.testing = True

    class TestDB(unittest.TestCase):
        def setUp(self):
            super().setUp()
            self.connection = db.engine.connect()
            self.transaction = self.connection.begin()
            
        def tearDown(self):
            self.transaction.rollback()
            self.connection.close()
