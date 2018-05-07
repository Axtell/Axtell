from flask_wtf import FlaskForm
from flask_uploads import UploadSet, IMAGES
from wtforms import StringField
from wtforms.validators import DataRequired, Email, URL, Optional
from flask_wtf.file import FileField, FileAllowed

images = UploadSet('images', IMAGES)


class UserSettingsForm(FlaskForm):
    name = StringField('Display Name', validators=[DataRequired()])
    email = StringField('Email Address', validators=[DataRequired(), Email()])
    avatar_file = FileField('Avatar', validators=[Optional(), FileAllowed(images, 'Images only!')])
    avatar = StringField('Avatar URL', validators=[Optional(), URL()])

    def validate(self):
        if not super(UserSettingsForm, self).validate():
            return False
        if not self.avatar_file.data and not self.avatar.data:
            msg = "You must supply either an image or a URL for an avatar!"
            self.avatar.errors.append(msg)
            self.avatar_url.errors.append(msg)
            return False
        if self.avatar_file.data and self.avatar.data:
            msg = "You may only supply an image or a URL for an avatar - not both!"
            self.avatar.errors.append(msg)
            self.avatar_url.errors.append(msg)
            return False
        return True
