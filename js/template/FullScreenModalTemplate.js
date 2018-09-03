import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import ButtonTemplate, { ButtonColor, ButtonStyle } from '~/template/ButtonTemplate';
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
     * @param {Element} opts.icon - Icon representing topic in white
     * @param {Node} opts.body - Root node to embed
     */
    constructor({ title, submitButton = null, color = FSModalColor.default, icon, body }) {
        const closeButton = (
            new ButtonTemplate({
                text: 'close',
                icon: <img src={Theme.current.imageForTheme('close')}/>,
                color: ButtonColor.highContrast,
                style: ButtonStyle.minimal
            }).unique()
        );

        const root = (
            <div class="fs-modal">
                <div class={`fs-modal__header fs-modal--scheme-${color}`}>
                    <div class="content fs-modal__header__components">
                        <div class="fs-modal__header__component fs-modal__header__component--type-image">
                            { icon }
                        </div>
                        <div class="fs-modal__header__component fs-modal__header__component--type-title">
                            { title }
                        </div>
                    </div>
                </div>
                <div class="fs-modal__header fs-modal__header--scheme-white fs-modal__header--shadow">
                    <div class="content fs-modal__header__components">
                        { closeButton }
                        <div class="fs-modal__header__component fs-modal__header__component--type-spacer"></div>
                        { submitButton?.unique() || <DocumentFragment/> }
                    </div>
                </div>
                <div class="fs-modal__body">
                    <div class="content">{ body }</div>
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
