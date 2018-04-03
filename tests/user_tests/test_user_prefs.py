from tests.test_base import TestFlask
from app.models.User import User
from app.models.Theme import Theme
from app.session.user_session import set_session_user
from flask import g
from config import auth
from unittest import skipIf

# noinspection PyUnresolvedReferences
import app.instances.auth
# noinspection PyUnresolvedReferences
import app.routes.user
# noinspection PyUnresolvedReferences
from app.routes import user_settings


class TestUserPrefs(TestFlask):
    def setUp(self):
        super().setUp()

        self.session.begin_nested()

        light_theme = Theme(name='light')
        dark_theme = Theme(name='dark')

        self.session.add(light_theme)
        self.session.add(dark_theme)

        self.user = User(name="Test User", email="test@example.com", theme=light_theme.id)
        self.session.add(self.user)

        self.session.commit()

        with self.client as c:
            with c.session_transaction() as sess:
                set_session_user(self.user, current_session=sess)
                g.user = self.user

    def test_set_user_email(self):
        response = self.client.post("/preferences/email", data={"email": "v2.ppcg@gmail.com"})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.user.email, "v2.ppcg@gmail.com")

        bad_response = self.client.post("/preferences/email", data={"email": "fakeemail"})
        self.assertEqual(bad_response.status_code, 400)
        self.assertEqual(self.user.email, "v2.ppcg@gmail.com")

    def test_set_user_name(self):
        response = self.client.post("/preferences/name", data={"name": "foobar"})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.user.name, "foobar")

    def test_set_user_theme(self):
        response = self.client.post("/theme/dark", data={})
        self.assertEqual(response.status_code, 204)
        dark_theme = Theme.query.filter_by(id=self.user.theme).first()
        self.assertEqual(dark_theme.name, "dark")

        self.client.get("/index.html")  # make sure the dark theme files get generated

        response2 = self.client.post("/theme/light", data={})
        self.assertEqual(response2.status_code, 204)
        light_theme = Theme.query.filter_by(id=self.user.theme).first()
        self.assertEqual(light_theme.name, "light")

    @skipIf(auth['imgur']['client-id'] == "IMGUR_CLIENT_ID", "need valid imgur client id")
    def test_set_user_avatar(self):
        response = self.client.post("/preferences/avatar",
                                    data={"avatar": "https://i.ytimg.com/vi/mMbvWUxgM8U/maxresdefault.jpg"})
        self.assertEqual(response.status_code, 204)
        self.assertTrue(self.user.avatar_url().startswith("https://i.imgur.com/"))

        bad_response = self.client.post("/preferences/avatar", data={"avatar": "not_a_url"})
        self.assertEqual(bad_response.status_code, 400)
        self.assertTrue(self.user.avatar != "not_a_url")
