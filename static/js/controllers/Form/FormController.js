import ViewController from '~/controllers/ViewController';
import FormControllerDelegate from '~/delegate/FormControllerDelegate';

/**
 * Performs really basic form validation
 */
export default class FormController extends ViewController {
    /**
     * Sets up an empty form validation for a form. This will run when the form
     * is submitted, or manually using the `.submit()` function. Setup a
     * delegate too
     *
     * @param {HTMLFormElement} form Form element
     */
    constructor(form) {
        super();

        form.controller = this;

        this._form = form;
        this._registerForm(form);

        /**
         * @type {FormControllerDelegate}
         */
        this.delegate = new FormControllerDelegate();

        this._constraints = [];
        this._displays = [];
    }

    _registerForm(form) {
        form.addEventListener("submit", (event) => {
            if (this.submit() === false) {
                event.preventDefault();
            }
        }, false);
    }

    /**
     * Adds a form constraint
     * @param {FormConstraint} constraint A constraint to add to the current
     *                                    form.
     */
    addConstraint(constraint) {
        this._constraints.push(constraint);
    }

    /**
     * Adds a list of constraints.
     * @param {FormConstraint[]} constraints A list of form constraints to add
     */
    addConstraints(constraints) {
        for (let i = 0; i < constraints.length; i++) {
            this.addConstraint(constraints[i]);
        }
    }

    /**
     * Validates the form.
     * @return {ValidationError[]} List of errors
     */
    validate() {
        let formErrors = [];
        for (let i = 0; i < this._constraints.length; i++) {
            let constraint = this._constraints[i];
            let errors = constraint.validate();
            for (let j = 0; j < errors.length; j++) {
                formErrors.push(errors[j]);
            }
        }
        return formErrors;
    }

    /**
     * Hides error displays
     */
    clearDisplays() {
        this._displays.forEach(el => el.parentNode.removeChild(el));
        this._displays = [];
    }

    /**
     * Displays the errors.
     * @param {ValidationError[]} errors List of validation errors.
     */
    display(errors) {
        let sortedErrors = new Map();

        this.clearDisplays();
        for (let i = 0; i < errors.length; i++) {
            let {error, node} = errors[i];

            if (sortedErrors.has(node)) {
                sortedErrors.get(node).push(error);
            } else {
                sortedErrors.set(node, [error]);
            }
        }

        let displays = [];
        for (let [node, errors] of sortedErrors) {
            let target = node;
            let parent = node.parentNode;

            // Check if there is a label for the elem
            let labels = node.labels;
            if (labels && labels.length >= 1) {
                target = labels[0].nextElementSibling;
                parent = labels[0].parentNode;
            }

            let errorList = document.createElement('ul');
            errorList.className = "form-errors";
            for (let i = 0; i < errors.length; i++) {
                let errorEl = document.createElement('li');
                errorEl.appendChild(document.createTextNode(errors[i]));
                errorList.appendChild(errorEl);
            }
            displays.push(errorList);

            parent.insertBefore(errorList, target);
        }

        this._displays = displays;
    }

    /**
     * Submits a form.
     * @return {boolean} `true` if succesful, false otherwise.
     */
    submit() {
        let errors = this.validate();
        if (errors.length === 0) {
            // No errors!
            setTimeout(() => {
                this.delegate.formDidSubmit(this);
            }, 0);

            let override = this.delegate.formWillSubmit(this);
            if (typeof override === 'undefined') {
                return true;
            } else {
                return override;
            }
        } else {
            setTimeout(() => {
                this.delegate.formDidError(this, errors);
            }, 0);
            return false;
        }
    }

    /**
     * Creates or sets a form field with a `name` as an identifying key.
     *
     * @param {string} value - Value of the new field.
     * @param {string} name - name identifying field
     */
    setFieldWithName(value, name) {
        let input = this._form.elements[name];

        if (typeof input === 'undefined') {
            this._form.appendChild(<input type="hidden" name={name} value={value}/>);
        } else {
            input.value = value;
        }
    }
}
