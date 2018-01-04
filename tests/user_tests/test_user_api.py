import json

from app.models.User import User
from tests.test_base import TestFlask

# this is necessary, but PyCharm disagrees
# noinspection PyUnresolvedReferences
import app.instances.auth
# noinspection PyUnresolvedReferences
import app.routes.user


class TestUserAPI(TestFlask):
    def setUp(self):
        super().setUp()

        self.session.begin_nested()

        self.user = User(name='Test User', email='test@user.com')
        self.session.add(self.user)
        self.session.commit()

    def test_user_get(self):
        result = self.client.get(f'/user/{self.user.id}')
        self.assertEqual(result.status_code, 200)

        user_data = json.loads(result.data)

        self.assertEqual(user_data['id'], self.user.id)
        self.assertEqual(user_data['name'], self.user.name)
