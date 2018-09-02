from tests.test_base import TestFlask

# noinspection PyUnresolvedReferences
import app.routes.static

# noinspection PyUnresolvedReferences
import app.routes.codepage

import golflang_encodings
import json


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
        codepage = {int(k): v for k, v in result.json['jelly'].items()}
        self.assertEqual(codepage, golflang_encodings.add_encodings.codepages.get('Jelly'))

    def test_all_encodings(self):
        result = self.client.get('/static/encodings')
        self.assertEqual(result.status_code, 200)
        json_result = json.loads(result.data)
        encodings = frozenset(json_result['encodings'])
        self.assertEqual(encodings, app.routes.codepage.ALL_ENCODINGS)
