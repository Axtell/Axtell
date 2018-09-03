import ErrorManager from '~/helpers/ErrorManager';
import isEmail from 'validator/lib/isEmail';

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
 * @property {Validator} sourceValidator - The 'validator' object.
 */

/**
 * Specifies what constraints a given form field must satisfy
 */
export default class FormConstraint {
    /**
     * Creates a form constraint (doing nothing).
     */
    constructor() {
        this._validators = [];
    }

    /**
     * Adds a validator to execute
     * @param {Function} callback Validator to call. Passed element for first
     *                             arg.
     * @param {string} error String to print on error if the validation fails.
     */
    addValidator(callback, error) {
        this._validators.push({ callback, error });
        return this;
    }

    /**
     * Specifies the length must be between (inclusive) bounds between a min
     * and a max. For input elements.
     *
     * @param {number} min a positive integer representing the minimum length.
     * @param {number} max a positive integer representing the maximum length.
     * @return {FormConstraint} chainable object.
     */
    length(min, max) {
        return this.addValidator(
            (value) => value.length >= min && value.length <= max,
            `Must be at least ${min} and at most ${max} characters long.`
        );
    }

    /**
     * Checks if a field is an email
     * @return {FormConstraint} chainable object.
     */
    isEmail() {
        return this.addValidator(
            (value) => isEmail(value),
            `Provide a valid email.`
        )
    }

    /**
     * Makes sure a form value is not empty
     * @param {string} error - error string to show.
     * @return {FormConstraint} chainable object.
     */
    notEmpty(error = `Must specify a value`) {
        return this.addValidator(
            (value) => value.length > 0,
            error
        );
    }

    /**
     * Checks if has a value
     * @param {string} error - Error to show
     * @return {FormConstraint} chainable object
     */
    hasValue(error = `Must specify a value`) {
        return this.addValidator(
            value => !!value,
            error
        );
    }

    /**
     * Requires a field to match a certain regex.
     * @param {RegExp} regex - Regex to match `elem.value` to.
     * @return {FormConstraint} chainable object.
     */
    regex(regex) {
        return this.addValidator(
            (value) => regex.test(value),
            `Must match pattern ${regex.source}`
        )
    }

    /**
     * Runs validation on the element.
     * @param {any} value - Any value to run validator on
     * @return {ValidationError[]} list of form errors. Empty array if none.
     */
    validate(value) {
        let errors = [];
        for (let i = 0; i < this._validators.length; i++) {
            let validator = this._validators[i];
            let res = validator.callback(value);
            if (res === false) {
                errors.push({
                    node: this._elem,
                    error: validator.error,
                    sourceValidator: validator
                })
            }
        }
        return errors;
    }
}
