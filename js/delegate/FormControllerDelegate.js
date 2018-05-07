/**
 * Represents a form.
 * @interface
 */
export default class FormControllerDelegate {
    /**
     * Called when the form attempts to submit.
     * @param {FormController} controller
     * @param {FormError[]} errors
     */
    formDidError(controller, errors) {
        void 0;
    }

    /**
     * Called right before the form will submit.
     * @param {FormController} controller
     * @return {?boolean} if this returns. The return value will override
     *                    submission.
     */
    formWillSubmit(controller) {
        return void 0;
    }

    /**
     * Called right after the form has submited (succesful validation)
     * @param {FormController} controller
     */
    formDidSubmit(controller) {
        void 0;
    }
}

/**
 * Submits to same endpoint as original form but instead
 * @abstract
 */
export class AJAXFormControllerDelegate extends FormControllerDelegate {
    /**
     * Will perform AJAX submission for the form. If you are subclassing use
     * `return super.formWillSubmit(controller);`.
     *
     * @override
     * @param  {FormController} controller Form controller to request.
     * @return {boolean} Always false
     */
    formWillSubmit(controller) {
        this._performRequest(controller, controller.request);
        return false;
    }

    async _performRequest(controller, request) {
        this.setProgressState(true);
        try {
            let response = await request.run();
            this.didSubmissionSuccess(controller, response);
        } catch(error) {
            this.didSubmissionError(controller, error);
        } finally {
            this.setProgressState(false);
        }
    }

    /**
     * Sets the form's progress state.
     * @param {FormController} controller - FormController
     * @param {boolean} state - Loading state to set to.
     * @param {Object} response - Response data
     */
    setProgressState(controller, state) { return void 0; }

    /**
     * Called when AJAX finished with no error.
     * @param {FormController} controller - FormController
     * @param {Object} response - Response data
     */
    didSubmissionSuccess(controller, response) { return void 0; }

    /**
     * Called when AJAX errored
     * @param {FormController} controller - FormController
     * @param {Object} error - Error object
     * @param {number} status - Error status code.
     */
    didSubmissionError(controller, error) { return void 0; }
}
