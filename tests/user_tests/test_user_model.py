from app.models.User import User
from app.models.Theme import Theme
from tests.test_base import TestFlask


class TestUserModel(TestFlask):
    def setUp(self):
        super().setUp()

    def test_user_add(self):
        new_user = User(name='Test User', email='test@user.com')

        self.session.begin_nested()
        self.session.add(new_user)
        self.session.commit()

        # Test retrieving user
        user_query = User.query.filter_by(id=new_user.id)

        user_count = user_query.count()
        self.assertEqual(user_count, 1)

        matched_user = user_query.first()
        self.assertEqual(matched_user.id, new_user.id)
        self.assertEqual(matched_user.name, new_user.name)
        self.assertEqual(matched_user.email, new_user.email)
