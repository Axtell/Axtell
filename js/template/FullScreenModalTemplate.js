import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import Template from '~/template/Template';
import Theme from '~/models/Theme';

/**
 * Colors of the modal
 * @typedef {Object} FSModalColor
 * @property {string} default - Default color
 */
export const FSModalColor = {
    default: 'default'
};

export const FS_MODAL_NOT_OPEN = Symbol('FSModal.Error.NotOpen');

/**
 * See {@link FullScreenModalController}
 */
export default class FullScreenModalTemplate extends Template {

    /**
     * Creates a full screen modal template.
     * @param {Object} opts
     * @param {Element} opts.title - HTML element with title.
     * @param {FSModalColor} [opts.color=FSModalColor.default]
     * @param {?ButtonTemplate} [opts.submitButton=null] - If exists, a submit button
     * @param {Node} opts.body - Root node to embed
     */
    constructor({ title, submitButton = null, color = FSModalColor.default, body }) {
        const closeButton = (
            <a class="fs-modal__header__component fs-modal__header__component--type-image">
                <img src={Theme.light.imageForTheme('close')}/>
            </a>
        );

        const root = (
            <div class={`fs-modal fs-modal--scheme-${color}`}>
                <div class="fs-modal__header">
                    { closeButton }
                    <div class="fs-modal__header__component fs-modal__header__component--type-title">
                        { title }
                    </div>
                    { submitButton?.unique() || <DocumentFragment/> }
                </div>
            </div>
        );
        super(root);

        /**
         * The submit button provided if exists
         * @type {?ButtonTemplate}
         */
        this.submitButton = submitButton;

        /**
         * The controller which manages this
         * @type {?FullScreenModalController}
         */
        this.controller = null;


        closeButton.addEventListener('click', () => {
            if (this.controller) {
                this.controller.dismiss()
                    .catch(HandleUnhandledPromise);
            } else {
                ErrorManager.warn('Attempted to close unopen modal', FS_MODAL_NOT_OPEN);
            }
        })
    }

}
