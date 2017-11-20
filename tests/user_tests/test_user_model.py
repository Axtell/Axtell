import app.models
from tests.test_base import TestBase


class TestUserModel(TestBase.TestDB):
    def setUp(self):
        super().setUp()

    def test_user_add(self):
        new_user = app.models.User.User(name='Test User', email='test@user.com')
        self.session.add(new_user)
        self.session.commit()

        # Test retrieving user
        user_query = app.models.User.User.query.filter_by(id=new_user.id)
        
        user_count = user_query.count()
        self.assertEqual(user_count, 1)
        
        matched_user = user_query.first()
        self.assertEqual(matched_user.id, new_user.id)
        self.assertEqual(matched_user.name, new_user.name)
        self.assertEqual(matched_user.email, new_user.email)
