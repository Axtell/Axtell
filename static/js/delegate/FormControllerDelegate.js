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
    formDidError(controller, errors) { void 0; }

    /**
     * Called when the form will submit (succesful validation)
     * @param {FormController} controller
     */
    formDidSubmit(controller) { void 0; }
}
