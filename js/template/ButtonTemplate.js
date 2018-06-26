import Template from '~/template/Template';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export const ButtonColor = {
    green: 'green',
    accent: 'accent',
    blue: 'blue',
    plain: null
};

/**
 * A button
 */
export default class ButtonTemplate extends Template {
    /**
     * @param {string} options.text
     * @param {string} options.icon
     * @param {ButtonColor} options.color
     */
    constructor({ text, icon, color }) {
        let node;

        if (icon) text = " " + text;

        if (color === null) {
            node = (
                <button class="button button--shadow-none button--color-plain button--align-center">
                    { icon || <DocumentFragment/> }
                    { text }
                </button>
            );
        } else {
            node = (
                <button class={`button button--color-${color} button--align-center`}>
                    { icon || <DocumentFragment/> }
                    { text }
                </button>
            );
        }
        super(node);

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        node.addEventListener("click", () => {
            this.delegate.didSetStateTo(this, true);
        });
    }
}
