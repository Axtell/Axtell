from tests.test_base import TestBase

# noinspection PyUnresolvedReferences
import app.routes.static


class TestStatic(TestBase.TestFlask):
    def test_home_loading(self):
        result = self.get('/')
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.content_type.startswith('text/html'))

    def test_404(self):
        result = self.get('/404')
        self.assertEqual(result.status_code, 404)
        self.assertTrue(result.content_type.startswith('text/html'))
