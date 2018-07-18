import ViewController from '~/controllers/ViewController';
import ModalViewTemplate from '~/template/ModalViewTemplate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const MODAL_BLUR_RADIUS = '16px';

/**
 * This is like {@link ModalController} but better. This uses ModalTemplate
 */
export default class ModalViewController extends ViewController {
    /**
     * Creates controller for context
     * @param {HTMLElement} context - you prob want to use .shared
     */
    constructor(context) {
        super();

        /** @private */
        this.context = context;

        this._dim = null;
        this._activeTemplate = null;
        this._eventListener = null;
    }

    /**
     * Presents a template.
     * @param {ModalViewTemplate} template - The modal template
     */
    async present(template) {
        await this.hide();

        const anime = await import('animejs');

        const dim = <div class="modal-view__dim"/>;
        const instance = template.loadInContext(dim);

        const listener = dim.addEventListener('click', (event) => {
            if (!instance.contains(event.target)) {
                this.hide()
                    .catch(HandleUnhandledPromise);
            }
        })

        this._dim = dim;
        this._eventListener = listener;
        this._activeTemplate = instance; // Set this last to avoid race condition

        instance.style.opacity = 0;
        instance.style.position = 'fixed';
        instance.style.left = '50%';
        instance.style.maxWidth = '90%';
        instance.style.maxHeight = '90%';
        instance.style.overflow = 'auto';
        instance.style.transform = 'translate(-50%, -50%)';
        instance.style.zIndex = +dim.style.zIndex + 1;

        this.context.appendChild(dim);

        await anime.timeline()
            .add({
                targets: dim,
                opacity: [0, 1],
                backdropFilter: ['blur(0px)', `blur(${MODAL_BLUR_RADIUS})`],
                webkitBackdropFilter: ['blur(0px)', `blur(${MODAL_BLUR_RADIUS})`],
                duration: 300
            })
            .add({
                offset: '-=50',
                targets: instance,
                opacity: [0, 1],
                top: ['60%', '50%'],
                easing: 'easeOutBack',
                duration: 500
            })
            .finished;

        template.controller = this;
    }

    /**
     * Hides the current template if there is one
     */
    async hide() {
        if (!this._activeTemplate) return;

        // Avoids race condition
        const instance = this._activeTemplate;
        this._activeTemplate = null;

        this._dim.removeEventListener('click', this._eventListener);

        const anime = await import('animejs');

        this._dim.style.pointerEvents = 'none'
        await anime.timeline()
            .add({
                targets: instance,
                opacity: [1, 0],
                top: ['50%', '60%'],
                easing: 'easeInBack',
                duration: 500
            })
            .add({
                targets: this._dim,
                opacity: [1, 0],
                backdropFilter: [`blur(${MODAL_BLUR_RADIUS})`, 'blur(0px)'],
                webkitBackdropFilter: [`blur(${MODAL_BLUR_RADIUS})`, 'blur(0px)'],
                duration: 300
            })
            .finished;

        this.context.removeChild(this._dim);

        this._dim = null;
    }

    static shared = new ModalViewController(document.body);
}
