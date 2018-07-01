import Template from '~/template/Template';
import Random from '~/modern/Random';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export const TextInputType = {
    Title: 'text-input--type-title',
    Email: '',
    URL: 'text-input--type-url'
}

export default class TextInputTemplate extends Template {
    /**
     * A group of label and the input
     * @param {TextInputType} type
     * @param {string} placeholder
     */
    constructor(type, placeholder = "") {
        super(
            <input type="text"
                   class={`text-input text-input--type-clean ${type}`}
                   placeholder={placeholder} />
        );

        this.delegate = new ActionControllerDelegate();
        this.defineLinkedInput('value');

        this.underlyingNode.addEventListener("input", () => {
            this.delegate.didSetStateTo(this, this.value);
        });
    }

    /** @override */
    didLoad() {
        this.delegate.didSetStateTo(this, "");
    }
}
