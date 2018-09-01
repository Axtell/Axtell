import Template from '~/template/Template';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

import tippy from 'tippy.js/dist/tippy.all.min.js';

/**
 * @typedef {Object} ButtonColor
 * @property {Object} green - Green background
 * @property {Object} accent - Accent colored background
 * @property {Object} blue - Blue background
 * @property {Object} plain - No special coloring just blue text
 * @property {Object} accentBorder - Accent border and foreground
 */
export const ButtonColor = {
    green: 'green',
    accent: 'accent',
    blue: 'blue',
    plain: null,
    accentBorder: 'accent-border'
};

/**
 * A button
 */
export default class ButtonTemplate extends Template {
    /**
     * @param {Object} opts
     * @param {string} options.text - The text of the button
     * @param {?Element} options.icon - The icon node
     * @param {ButtonColor} options.color
     */
    constructor({ text, icon, color }) {
        let node;

        if (icon) text = " " + text;

        if (color === null) {
            node = (
                <button class="button button--shadow-none button--color-plain button--align-center">
                    { icon || <DocumentFragment/> }
                    { " " }
                </button>
            );
        } else {
            node = (
                <button class={`button button--color-${color} button--align-center`}>
                    { icon || <DocumentFragment/> }
                    { " " }
                </button>
            );
        }

        super(node);

        /**
         * The label of the button. Reactive
         * @type {string}
         */
        this.text = null;
        node.appendChild(<span>{ this.defineLinkedText('text', text) }</span>);

        /**
         * If should be full width
         * @type {Boolean}
         */
        this.isWide = null;
        this.defineLinkedClass('isWide', 'button--size-wide');

        /**
         * If should be 'small'
         * @type {Boolean}
         */
        this.isSmall = null;
        this.defineLinkedClass('isSmall', 'button--size-small');

        /**
         * If should have little bit of padding on top
         * @type {Boolean}
         */
        this.hasPaddedTop = null;
        this.defineLinkedClass('hasPaddedTop', 'button--padding-top');

        /**
         * If the button is active. Only applies to those colors which have this preference set.
         * @type {Boolean}
         */
        this.isActive = null;
        this.defineLinkedClass('isActive', 'button--active');

        /**
         * If should have little padding on sides
         * @type {Boolean}
         */
        this.hasPaddedHorizontal = null;
        this.defineLinkedClass('hasPaddedHorizontal', 'button--padding-horizontal');

        /**
         * If has shadow
         * @type {Boolean}
         */
        this.hasShadow = null;
        this.defineLinkedClass('hasShadow', '!button--shadow-none');

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        this._isDisabled = false;

        /**
         * Observes the click of the button
         * @type {Observable}
         */
        this.observeClick = fromEvent(node, 'click')
            .pipe(
                filter(() => !this._isDisabled));

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
     * Called when loading
     */
    async trigger() {
        await this.delegate.didSetStateTo(this, true);
    }
}
