import ErrorManager from '~/helper/ErrorManager';

export const NoElementWithId = Symbol('Form.FormConstraint.NoElementWithId');

/**
 * @typedef {Object} Validator
 * @property {Function} callback - Runs validator given element.
 * @property {string} error - String to display on error.
 */

/**
 * @typedef {Object} ValidationError
 * @property {HTMLElement} node - Node with error.
 * @property {string} error - String describing error
 */

/**
 * Specifies what constraints a given form field must satisfy
 */
export default class FormConstraint {
    /**
     * Creates a form constraint (doing nothing) for an existing element.
     * @param {string|HTMLInputElement} elem Either an id or an existing element
     */
    constructor(elem) {
        if (typeof elem === 'string') {
            this._elem = document.getElementById(elem);
            if (!this._elem) {
                ErrorManager.raise(
                    `Could not find any element with provided id ${elem}`,
                    NoElementWithId
                );
            }
        } else {
            this._elem = elem;
        }

        this._validators = [];
    }

    /**
     * Adds a validator to execute
     * @param {Function} validator Validator to call. Passed element for first
     *                             arg.
     * @param {string} error String to print on error if the validation fails.
     */
    addValidator(callback, error) {
        this._validators.push({callback, error});
        return this;
    }

    /**
     * Specifies the length must be between (inclusive) bounds between a min
     * and a max. For input elements.
     *
     * @param {number} min a positive integer representing the minimum length.
     * @param {number} max a positive integer representing the maximum length.
     */
    length(min, max) {
        return this.addValidator(
            (elem) => elem.value.length >= min && elem.value.length <= max,
            `Must be at least ${min} and at most ${max} characters long.`
        );
    }

    /**
     * Makes sure a form value is not empty
     * @param {string} error - error string to show.
     */
    notEmpty(error = `Must specify a value`) {
        return this.addValidator(
            (elem) => elem.value.length > 0,
            error
        );
    }

    /**
     * Requires a field to match a certain regex.
     * @param {RegExp} regex - Regex to match `elem.value` to.
     */
    regex(regex) {
        return this.addValidator(
            (elem) => regex.test(elem.value),
            `Must match pattern ${regex.source}`
        )
    }

    /**
     * Runs validation on the element.
     * @return {FormError[]} list of form errors. Empty array if none.
     */
    validate() {
        let errors = [];
        for (let i = 0; i < this._validators.length; i++) {
            let validator = this._validators[i];
            let res = validator.callback(this._elem);
            if (res === false) {
                errors.push({
                    node: this._elem,
                    error: validator.error
                })
            }
        }
        return errors;
    }
}
