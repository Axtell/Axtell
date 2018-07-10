import ViewController from '~/controllers/ViewController';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

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
     */
    async present(template) {
        await this.hide();
        const anime = await import('animejs');
        const dim = <div/>;

        dim.style.position = 'fixed';
        dim.style.top = 0;
        dim.style.bottom = 0;
        dim.style.left = 0;
        dim.style.right = 0;
        dim.style.zIndex = 20;
        dim.style.background = 'rgba(0, 0, 0, 0.3)';

        const instance = template.loadInContext(dim);
        instance.style.opacity = 0;
        instance.style.position = 'fixed';
        instance.style.left = '50%';
        instance.style.maxWidth = '90%';
        instance.style.maxHeight = '90%';
        instance.style.overflow = 'auto';
        instance.style.transform = 'translate(-50%, -50%)';
        instance.style.zIndex = +dim.style.zIndex + 1;

        this.context.appendChild(dim);

        const listener = dim.addEventListener('click', (event) => {
            if (!dim.contains(event.target)) {
                this.hide()
                    .catch(HandleUnhandledPromise);
            }
        })

        await anime.timeline()
            .add({
                targets: dim,
                opacity: [0, 1]
            })
            .add({
                offset: 100,
                targets: instance,
                opacity: [0, 1],
                top: ['60%', '50%'],
                elasticity: 150
            })
            .finished;

        this._activeTemplate = instance;
        this._dim = dim;
        this._eventListener = listener;
    }

    /**
     * Hides the current template if there is one
     */
    async hide() {
        if (!this._activeTemplate) return;
        this._dim.removeEventListener('click', this._eventListener);

        const anime = await import('animejs');

        await anime.timeline()
            .add({
                targets: this._activeTemplate,
                opacity: [1, 0],
                top: ['50%', '60%'],
                easing: 'easeInBack',
                duration: 500
            })
            .add({
                targets: this._dim,
                opacity: [1, 0]
            })
            .finished;

        this._dim = null;
        this._activeTemplate = null;
    }

    static shared = new ModalViewController(document.body);
}
