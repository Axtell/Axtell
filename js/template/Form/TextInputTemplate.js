import Template from '~/template/Template';
import Random from '~/modern/Random';

export const TextInputType = {
    Title: 'text-input--type-title',
    Email: ''
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

        this.defineLinkedInput('value');
    }
}
