import ViewController from '~/controllers/ViewController';
import { AJAXFormControllerDelegate } from '~/delegate/FormControllerDelegate';
import FormConstraint from '~/controllers/Form/FormConstraint';

import User from '~/models/User';

export const PROFILE_FORM_ID = 'sf-profile';
export const DISPLAY_NAME_ID = 'display-name';
export const EMAIL_ID = 'user-email';

export const SAVE_BUTTON_ID = 'save-profile';

let viewController;
if (viewController = ViewController.of(PROFILE_FORM_ID)) {

    viewController.addConstraints([
        new FormConstraint(DISPLAY_NAME_ID)
            .length(User.MIN_USERNAME_LENGTH, User.MAX_USERNAME_LENGTH),

        new FormConstraint(EMAIL_ID)
            .isEmail()
    ]);

    viewController.delegate = new class extends AJAXFormControllerDelegate {
        formWillSubmit(controller) {
            controller.display([]);
            return super.formWillSubmit(controller);
        }

        formDidError(controller, errors) {
            controller.display(errors);
        }

        didSubmissionSuccess(controller, data) {
            window.location.reload();
        }

        didSubmissionError(controller, error) {
            console.log(error);
        }
    };
}
