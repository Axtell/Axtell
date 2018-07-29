import Template from '~/template/Template';
import Theme from '~/models/Theme';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

/**
 * Wrapper for modal templates. Subclass this. Prefer this over
 * the legacy {@link ModalTemplate}
 */
export default class ModalViewTemplate extends Template {
    /**
     * @param {?(Template|Element)} body - You can either compose this or subclass it with HTMLElement.
     *                                       Ommitable in which case an empty div will be root (useful when
     *                                       subclassing).
     * @param {Object} options
     * @param {string} options.title - The primary title
     * @param {?string} options.subtitle - If null then cannot add later
     * @param {number} options.requestedWidth - The width to attempt to make modal
     */
    constructor(body, opts) {
        if (!(body instanceof Template || body instanceof Element) && !opts) {
            opts = body;
            body = <div/>;
        }

        const { title, subtitle = null, requestedWidth } = opts;

        super(<div class="modal-view"/>);

        if (requestedWidth) {
            this.underlyingNode.style.width = `${requestedWidth}px`;
        }

        /**
         * Reactive title
         * @type {string}
         */
        this.title = null;

        /**
         * Reactive subtitle
         * @type {string}
         */
        this.subtitle = null;

        const closeButton = <img src={ Theme.current.staticImageForTheme('cross') } class="list-header__item--align-center list-header__item--size-double list-header__item--pad-left list-header__item--actionable"/>;
        this.underlyingNode.appendChild(
            <DocumentFragment>
                <div class="list-header">
                    <h1>{ this.defineLinkedText('title', title) }</h1>
                    { closeButton }
                </div>
                { subtitle !== null ? (
                    <div class="list-header list-header--style-caption">
                        <h2 class="header--style-caption">{ this.defineLinkedText('subtitle', subtitle) }</h2>
                    </div>
                ) : <DocumentFragment/> }
            </DocumentFragment>
        );

        let bodyInstance = null;
        if (body instanceof Template) {
            bodyInstance = body.loadInContext(this.underlyingNode);
        } else {
            bodyInstance = body;
            this.underlyingNode.appendChild(body);
        }

        closeButton.addEventListener('click', () => {
            this.controller.hide()
                .catch(HandleUnhandledPromise);
        });

        /**
         * This body instance
         * @type {Element}
         */
        this.body = bodyInstance;

        /**
         * Available when mounted
         * @type {?ModalViewController}
         */
        this.controller = null;
    }

    /**
     * Sets the requested width of the modal.
     * @type {number}
     */
    set requestedWidth(requestedWidth) { this.underlyingNode.style.width = `${requestedWidth}px`; }
}
