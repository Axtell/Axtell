import ViewController from '~/controllers/ViewController';
import ProgressButtonController from '~/controllers/ProgressButtonController';
import { AJAXFormControllerDelegate } from '~/delegate/FormControllerDelegate';
import FormConstraint from '~/controllers/Form/FormConstraint';
import ErrorManager from '~/helpers/ErrorManager';

import User from '~/models/User';

export const PROFILE_FORM_ID = 'sf-profile';
export const DISPLAY_NAME_ID = 'settings-profile-displayname';
export const EMAIL_ID = 'settings-profile-email';

export const SAVE_BUTTON_ID = 'save-profile';

let viewController;
if (viewController = ViewController.of(PROFILE_FORM_ID)) {
    const saveButton = new ProgressButtonController(
        document.getElementById(SAVE_BUTTON_ID)
    );

    viewController.addConstraints([
        new FormConstraint(DISPLAY_NAME_ID)
            .length(User.MIN_USERNAME_LENGTH, User.MAX_USERNAME_LENGTH),

        new FormConstraint(EMAIL_ID)
            .isEmail()
    ]);

    viewController.delegate = new class extends AJAXFormControllerDelegate {
        formWillSubmit(controller) {
            controller.clearDisplays();
            return super.formWillSubmit(controller);
        }

        formDidError(controller, errors) {
            controller.display(errors);
        }

        setProgressState(controller, state) {
            saveButton.setLoadingState(state);
        }

        didSubmissionSuccess(controller, data) {
            // window.location.reload();
        }

        didSubmissionError(controller, error) {
            ErrorManager.unhandled(error);
        }
    };
}
