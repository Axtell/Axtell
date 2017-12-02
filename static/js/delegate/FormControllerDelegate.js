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
