import unittest
from app.start import server

class TestBase:
    class TestFlask(unittest.TestCase):
        def setUp(self):
            self.app = server.test_client()
            self.app.testing = True
