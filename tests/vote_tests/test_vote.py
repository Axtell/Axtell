from tests.test_base import TestFlask
from app.controllers import vote
from app.session.user_session import set_session_user
from app.models.PostVote import PostVote
from app.models.AnswerVote import AnswerVote
from app.models.User import User
from app.models.Post import Post
from app.models.Answer import Answer
from flask import g


# noinspection PyUnresolvedReferences
from app.routes import vote as _vote


class TestVote(TestFlask):
    def setUp(self):
        super().setUp()

        self.session.begin_nested()
        self.user = User(name='Test User', email='test@user.com')
        self.session.add(self.user)

        self.test_post = Post(title='Testing Votes API', body='Testing Votes API')
        self.user.posts.append(self.test_post)
        self.session.add(self.test_post)

        self.answer = Answer(post_id=self.test_post.id)
        self.user.answers.append(self.answer)
        self.test_post.answers.append(self.answer)
        self.session.add(self.answer)

        self.session.commit()

        with self.client as c:
            with c.session_transaction() as sess:
                set_session_user(self.user, current_session=sess)
                g.user = self.user

        self.session.begin_nested()
        vote.do_post_vote(self.test_post.id, 1)

        self.session.begin_nested()
        vote.do_answer_vote(self.answer.id, -1)

    def test_post_vote_get(self):
        result = self.client.get(f"/post/{self.test_post.id}/vote")
        self.assertEqual(result.status_code, 200)

        data = result.json
        self.assertEqual(data['vote'], 1)
        self.assertEqual(data['user'], self.user.id)
        self.assertEqual(data['post'], self.test_post.id)

    def test_answer_vote_get(self):
        result = self.client.get(f"/answer/{self.answer.id}/vote")
        self.assertEqual(result.status_code, 200)

        data = result.json
        self.assertEqual(data['vote'], -1)
        self.assertEqual(data['user'], self.user.id)
        self.assertEqual(data['answer'], self.answer.id)

    def test_post_vote_change(self):
        self.session.begin_nested()

        post_result = self.client.post(f"/post/{self.test_post.id}/vote", data={'vote': 0})
        self.assertEqual(post_result.status_code, 200)

        get_result = self.client.get(f"/post/{self.test_post.id}/vote")
        self.assertEqual(get_result.status_code, 200)
        data = get_result.json
        self.assertEqual(data['vote'], 0)

    def test_answer_vote_change(self):
        self.session.begin_nested()

        post_result = self.client.post(f"/answer/{self.answer.id}/vote", data={'vote': 0})
        self.assertEqual(post_result.status_code, 200)

        get_result = self.client.get(f"/answer/{self.answer.id}/vote")
        self.assertEqual(get_result.status_code, 200)
        data = get_result.json
        self.assertEqual(data['vote'], 0)

    def test_post_vote_total(self):
        result = self.client.get(f"/post/{self.test_post.id}/votes")
        self.assertEqual(result.status_code, 200)

        data = result.json
        self.assertEqual(data['votes'], 1)

    def test_answer_vote_total(self):
        result = self.client.get(f"/answer/{self.answer.id}/votes")
        self.assertEqual(result.status_code, 200)

        data = result.json
        self.assertEqual(data['votes'], -1)
