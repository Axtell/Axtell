import ViewController from '~/controllers/ViewController';
import ModalViewTemplate from '~/template/ModalViewTemplate';
import KeyManager from '~/models/KeyManager';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const MODAL_BLUR_RADIUS = '16px';

/**
 * This is like {@link ModalController} but better. This uses ModalTemplate
 */
export default class ModalViewController extends ViewController {
    /**
     * Creates controller for context
     * @param {HTMLElement} context - you prob want to use .shared
     * @param {Object} opts
     * @param {number} [opts.baseZIndex=0]
     * @param {boolean} bumpAnimation If should default show bump anim
     */
    constructor(context, { baseZIndex = 10, bumpAnimation = true } = {}) {
        super();

        /** @private */
        this.context = context;

        this._dim = null;
        this._activeTemplate = null;
        this._eventListener = null;

        this._removeKeyHandler = null;

        this._baseZIndex = baseZIndex;
        this._bumpAnimation = bumpAnimation;
    }

    /**
     * Binds an element to trigger to show a modal. If the ID does NOT
     * exist this will not do any binding.
     *
     * @param {string|HTMLElement} node - ID of node or the node itself
     * @param {ModalViewTemplate} template - The modal template to show
     */
    bind(node, template) {
        if (typeof node === 'string') {
            node = document.getElementById(node);
        }

        if (node) {
            node.addEventListener('click', () => {
                this.present(template)
                    .catch(HandleUnhandledPromise);
            });
        }
    }

    /**
     * Presents a template.
     * @param {ModalViewTemplate} template - The modal template
     * @param {Object} opts
     * @param {boolean} [opts.bumpAnimation=true] show a little bump when animating
     * @param {string} [opts.alignmentClass=""] class to align with
     */
    async present(template, { bumpAnimation = this._bumpAnimation, alignmentClass = "" } = {}) {
        await this.hide();

        const anime = await import('animejs');

        const dim = <div class={`modal-view__dim ${alignmentClass}`}/>;
        const instance = template.loadInContext(dim);
        template.didLoad();

        const listener = dim.addEventListener('click', (event) => {
            if ((document.body.contains(event.target) || event.target === document.body) && !instance.contains(event.target)) {
                this.hide()
                    .catch(HandleUnhandledPromise);
            }
        })

        this._dim = dim;
        this._eventListener = listener;
        this._activeTemplate = instance; // Set this last to avoid race condition

        dim.style.zIndex = this._baseZIndex;

        instance.style.zIndex = +dim.style.zIndex + 1;

        this.context.appendChild(dim);

        this._removeKeyHandler = KeyManager.shared.register('Escape', () => {
            this.hide()
                .catch(HandleUnhandledPromise);
        });

        const timeline = anime.timeline()
            .add({
                targets: dim,
                opacity: [0, 1],
                backdropFilter: ['blur(0px)', `blur(${MODAL_BLUR_RADIUS})`],
                webkitBackdropFilter: ['blur(0px)', `blur(${MODAL_BLUR_RADIUS})`],
                duration: 300
            })

        if (bumpAnimation) {
            instance.style.opacity = 0;
            timeline.add({
                offset: '-=50',
                targets: instance,
                opacity: [0, 1],
                top: ['60%', '50%'],
                easing: 'easeOutBack',
                duration: 500
            });
        } else {
            instance.style.opacity = 1;
        }

        await timeline.finished;

        template.controller = this;
    }

    /**
     * Hides the current template if there is one
     * @param {Object} opts
     * @param {boolean} [bumpAnimation=true] show a little bump when animating
     */
    async hide({ bumpAnimation = this._bumpAnimation } = {}) {
        if (!this._activeTemplate) return;

        this._removeKeyHandler?.();

        // Avoids race condition
        const instance = this._activeTemplate;
        this._activeTemplate = null;

        this._dim.removeEventListener('click', this._eventListener);

        const anime = await import('animejs');

        this._dim.style.pointerEvents = 'none'
        const timeline = anime.timeline()
            .add({
                targets: instance,
                opacity: [1, 0],
                top: ['50%', '60%'],
                easing: 'easeInBack',
                duration: 500
            })

        if (bumpAnimation) {
            timeline.add({
                targets: this._dim,
                opacity: [1, 0],
                backdropFilter: [`blur(${MODAL_BLUR_RADIUS})`, 'blur(0px)'],
                webkitBackdropFilter: [`blur(${MODAL_BLUR_RADIUS})`, 'blur(0px)'],
                duration: 300
            });
        }

        await timeline.finished;

        this.context.removeChild(this._dim);

        this._dim = null;
    }

    static shared = new ModalViewController(document.body);
}
