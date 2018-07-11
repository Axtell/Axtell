import Template from '~/template/Template';
import Theme from '~/models/Theme';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

/**
 * Wrapper for modal templates. Subclass this. Prefer this over
 * the legacy {@link ModalTemplate}
 */
export default class ModalViewTemplate extends Template {
    /**
     * @param {Template} body
     * @param {string} options.title
     * @param {?string} options.subtitle - If null then cannot add later
     */
    constructor(body, { title, subtitle = null } = {}) {
        super(<div class="modal-view"/>);

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

        body.loadInContext(this.underlyingNode);

        closeButton.addEventListener('click', () => {
            this.controller.hide()
                .catch(HandleUnhandledPromise);
        });

        /** @type {?ModalViewController} */
        this.controller = null;
    }
}
