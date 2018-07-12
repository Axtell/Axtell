from tests.test_base import TestFlask

# noinspection PyUnresolvedReferences
import app.routes.static

import golflang_encodings


class TestStatic(TestFlask):
    def test_home_loading(self):
        result = self.client.get('/')
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.content_type.startswith('text/html'))

    def test_404(self):
        result = self.client.get('/404')
        self.assertEqual(result.status_code, 404)
        self.assertTrue(result.content_type.startswith('text/html'))

    def test_codepage(self):
        result = self.client.get('/static/encodings/jelly')
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.json['jelly'], golflang_encodings.add_encodings.codepages.get('Jelly'))
