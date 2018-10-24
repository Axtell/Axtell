import Template from '~/template/Template';

import { fromEvent } from 'rxjs/index';
import { map, startWith, share } from 'rxjs/operators';

/**
 * Checkbox template. When using with LabelGroup make sure to use the horizontal
 * style.
 * @implements {InputInterface}
 */
export default class CheckboxInputTemplate extends Template {

    /**
     * Create simple basic checkbox not much to see here.
     * @param {Object} options
     * @param {boolean} [options.isEnabled=false] - If should be initially enabled.
     */
    constructor({ isEnabled = false } = {}) {
        let checkboxIsEnabled = isEnabled;
        let checkbox = (
            <input
                type="checkbox"
                unsafe-checked={checkboxIsEnabled}
                class="" />
        );

        super(checkbox);

        /** @private */
        this.checkbox = checkbox;

        this._observeValue = fromEvent(this.checkbox, 'change')
            .pipe(
                map(event => event.target.checked),
                startWith(checkboxIsEnabled),
                share());
    }

    /** @override */
    get userInput() { return this.checkbox; }

    /** @override */
    observeValue() {
        return this._observeValue;
    }

}
