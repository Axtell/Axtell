import Template from '~/template/Template';
import Random from '~/modern/Random';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

import { merge, fromEvent } from 'rxjs';
import { map, mapTo, share } from 'rxjs/operators';

export const TextInputType = {
    Search: 'text-input--type-search',
    Title: 'text-input--type-title',
    Email: '',
    URL: 'text-input--type-url'
}

/**
 * Represents a single-line text input.
 * @implements {InputInterface}
 */
export default class TextInputTemplate extends Template {
    /**
     * A group of label and the input
     * @param {TextInputType} type
     * @param {string} placeholder
     * @param {Object} opts
     * @param {string} opts.classes - Additional classes
     * @param {boolean} [opts.autofocus=false]
     * @param {boolean} [opts.autocomplete=false]
     * @param {boolean} [opts.isOwned=false] - If the wrapper elem manages styles
     * @param {boolean} [opts.isWide=false] - If the text input should fill width.
     */
    constructor(type, placeholder = "", {
        classes = "",
        autocomplete = false,
        autofocus = false,
        isOwned = false,
        isWide = false
    } = {}) {
        super(
            <input type="text"
                   class={`text-input text-input--type-clean ${type} ${classes}`}
                   placeholder={placeholder}
                   unsafe-autofocus={autofocus}
                   unsafe-autocomplete={autocomplete} />
        );

        this.delegate = new ActionControllerDelegate();

        /**
         * Value of the input
         * @type {string}
         */
        this.value = null;
        this.defineLinkedInput('value');

        this.defineLinkedClass('isWide', 'text-input--size-wide')
        /**
         * If to fill width
         * @type {boolean}
         */
        this.isWide = isWide;

        this.defineLinkedClass('isOwned', 'text-input--owned')
        /**
         * If is owned by another style manager
         * @type {boolean}
         */
        this.isOwned = isOwned;

        this._observeInput = fromEvent(this.underlyingNode, 'input')
            .pipe(
                map(event => event.target.value),
                share());

        this.underlyingNode.addEventListener("input", () => {
            this.delegate.didSetStateTo(this, this.value);
        });
    }

    /**
     * Observes the value of the text input.
     * @return {Observable}
     */
    observeValue() {
        return this._observeInput;
    }

    /**
     * Observes the focus of the text input.
     * @return {Observable}
     */
    observeFocus() {
        return merge(
            fromEvent(this.underlyingNode, 'focus')
                .pipe(mapTo(true)),
            fromEvent(this.underlyingNode, 'blur')
                .pipe(mapTo(false))
        );
    }

    /**
     * Sets focus
     * @param {boolean} [focusValue=true] false if to unfocus true if to
     */
    focus(focusValue = true) {
        if (focusValue) {
            this.underlyingNode.focus();
        } else {
            this.underlyingNode.blur();
        }
    }


    // MARK: - InputInterface
    /** @override */
    get userInput() { return this.underlyingNode; }

    /** @override */
    didLoad() {
        this.delegate.didSetStateTo(this, "");
    }
}
