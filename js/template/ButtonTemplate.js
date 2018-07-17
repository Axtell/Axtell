import Template from '~/template/Template';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

import tippy from 'tippy.js/dist/tippy.all.min.js';

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

        this.defineLinkedClass('isWide', 'button--size-wide');
        this.defineLinkedClass('isSmall', 'button--size-small');
        this.defineLinkedClass('hasPaddedTop', 'button--padding-top');
        this.defineLinkedClass('hasPaddedHorizontal', 'button--padding-horizontal');

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        this._isDisabled = false;

        node.addEventListener("click", () => {
            if (this._isDisabled) return;
            this.trigger().catch(HandleUnhandledPromise);
        });

        this._message = null;

    }

    /**
     * Sets if disabled. Will stop click events from firing
     * @param {Boolean} isDisabled
     * @param {?string} message optional message to display
     */
    setIsDisabled(isDisabled, message = null) {
        this.underlyingNode.title = "";
        this._message?.destroy(true);

        if (isDisabled) {
            this._isDisabled = true;
            this.underlyingNode.classList.add('button--color-disabled');

            if (message) {
                this.underlyingNode.title = message;
                this._message = tippy.one(this.underlyingNode, {
                    duration: [200, 150],
                    size: 'small'
                })
            }
        } else {
            this._isDisabled = false;
            this.underlyingNode.classList.remove('button--color-disabled');
        }
    }

    /**
     * Do not call directly, called when loading
     */
    async trigger() {
        await this.delegate.didSetStateTo(this, true);
    }
}
