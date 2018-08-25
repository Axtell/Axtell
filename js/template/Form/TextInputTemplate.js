import Template from '~/template/Template';
import Random from '~/modern/Random';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import { fromEvent } from 'rxjs';

export const TextInputType = {
    Search: 'text-input--type-search',
    Title: 'text-input--type-title',
    Email: '',
    URL: 'text-input--type-url'
}

export default class TextInputTemplate extends Template {
    /**
     * A group of label and the input
     * @param {TextInputType} type
     * @param {string} placeholder
     * @param {Object} opts
     * @param {string} opts.classes - Additional classes
     * @param {boolean} opts.autofocus
     * @param {boolean} opts.isOwned
     */
    constructor(type, placeholder = "", { classes = "", autofocus = false, isOwned = false } = {}) {
        super(
            <input type="text"
                   class={`text-input text-input--type-clean ${type} ${classes}`}
                   placeholder={placeholder}
                   unsafe-autofocus={autofocus} />
        );

        this.delegate = new ActionControllerDelegate();

        /**
         * Value of the input
         * @type {string}
         */
        this.value = null;
        this.defineLinkedInput('value');

        this.defineLinkedClass('isOwned', 'text-input--owned')
        /**
         * If is owned by another style manager
         * @type {boolean}
         */
        this.isOwned = isOwned;

        this.underlyingNode.addEventListener("input", () => {
            this.delegate.didSetStateTo(this, this.value);
        });
    }

    /**
     * Observes value
     * @return {Observable}
     */
    observe() {
        return fromEvent(this.underlyingNode, 'input');
    }

    get input() { return this.underlyingNode; }

    /** @override */
    didLoad() {
        this.delegate.didSetStateTo(this, "");
    }
}
