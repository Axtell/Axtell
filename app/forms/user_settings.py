from flask_wtf import FlaskForm
from flask_uploads import UploadSet, IMAGES
from wtforms import StringField, FileField
from wtforms.validators import DataRequired, Email, URL
from flask_wtf.file import FileAllowed

images = UploadSet('images', IMAGES)


class UserSettingsForm(FlaskForm):
    name = StringField('name', validators=[DataRequired()])
    email = StringField('email', validators=[DataRequired(), Email()])
    avatar = FileField('avatar', validators=[FileAllowed(images, 'Images only!')])
    avatar_url = StringField('avatar_url', validators=[URL()])
