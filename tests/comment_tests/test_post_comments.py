from tests.test_base import TestFlask
from app.models.Post import Post
from app.models.PostComment import PostComment
from app.models.User import User
from app.session.user_session import set_session_user
from flask import g

# this is necessary, but PyCharm disagrees
# noinspection PyUnresolvedReferences
from app.routes import *


class TestPostComments(TestFlask):

    def setUp(self):
        super().setUp()

        self.session.begin_nested()

        self.user = User(name="Test User", email="test@example.com")
        self.post = Post(title="Test Post", body="Test Post", user_id=self.user.id)
        self.user.posts.append(self.post)

        self.session.add(self.user)
        self.session.add(self.post)

        self.session.commit()

        with self.client as c:
            with c.session_transaction() as sess:
                set_session_user(self.user, current_session=sess)
                g.user = self.user

    def test_post_comment_model(self):
        test_comment = PostComment(post_id=self.post.id, text="foobar", user_id=self.user.id)
        self.user.post_comments.append(test_comment)
        self.post.comments.append(test_comment)

        self.assertEqual(test_comment.user.id, self.user.id)
        self.assertEqual(test_comment.test, "foobar")
        self.assertEqual(test_comment.post_id, self.post.id)
        self.assertEqual(len(self.post.comments), 1)
        self.assertEqual(len(self.user.post_comments), 1)

    def test_make_post_comment(self):
        short_result = self.client.post(f'/post/{self.post.id}/comment', data={"comment_text": "foo"})
        self.assert400(short_result)

        long_result = self.client.post(f'/post/{self.post.id}/comment', data={"comment_text": "a"*141})
        self.assert400(long_result)

        result = self.client.post(f'/post/{self.post.id}/comment', data={"comment_text": "foobarbazblargh"})
        self.assertEqual(result.status_code, 302)

        comment_id = self.post.comments[0].id
        comment_result = self.client.get(f"/post/{self.post.id}/comments/{comment_id}")
        self.assert200(comment_result)
        self.assertEqual(comment_result.json['text'], "foobarbazblargh")
        self.assertEqual(comment_result.json['rendered_text'], "<p>foobarbazblargh</p>\n")
