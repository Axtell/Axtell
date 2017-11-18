from tests.test_base import TestBase

class TestStatic(TestBase):
    def test_home_loading(self):
        result = self.app.get('/')
        self.assertEqual(result.status_code, 200)
