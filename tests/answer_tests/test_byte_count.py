from tests.test_base import TestFlask
from app.models.Post import Post
from app.models.Answer import Answer
from app.models.User import User


class TestByteCount(TestFlask):

    def setUp(self):
        super().setUp()

        self.db.begin_nested()

        self.user = User(name='Test User', email='test@example.com')
        self.session.add(self.user)

        self.post = Post(title='Test Post Please ignore', body='I said please ignore!', user_id=self.user.id)
        self.user.posts.append(self.post)
        self.session.add(self.post)

    def test_byte_count(self):
        answer = Answer(language_id="python3", language_name="Python 3", code="print('Hello, World!')",
                        user_id=self.user.id)
        self.assertEqual(answer.byte_len, len("print('Hello, World!')"))

        answer2 = Answer(language_id="actually", language_name="Actually", code="⌠H⌡", encoding='cp437',
                         user_id=self.user.id)
        self.assertEqual(answer2.byte_len, 3)
