from tests.test_base import TestBase
from app.models import User
import json


class TestUserAPI(TestBase.TestFlask, TestBase.TestDB):
    def setUp(self):
        super().setUp()
        
        self.user = User(name='Test User', email='test@user.com')
        self.session.add(self.user)
        self.session.commit()
    
    def test_user_get(self):
        result = self.app.get(f'/user/{self.user.id}')
        self.assertEqual(result.status_code, 200)
        
        user_data = json.loads(result.data)
        
        self.assertEqual(user_data['id'], self.user.id)
        self.assertEqual(user_data['name'], self.user.name)
        self.assertEqual(user_data['email'], self.user.email)
