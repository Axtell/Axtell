import ViewController from '~/controllers/ViewController';

/**
 * Controls a 'FullScreenModalTemplate' which is used for things like answer UI.
 */
export default class FullScreenModalTemplate extends ViewController {

    static shared = new FullScreenModalTemplate(document.body);

    /**
     * Creates empty instance
     * @param {Element} parent
     */
    constructor(parent) {
        super();

        /**
         * Parent node
         * @type {Element}
         */
        this.parent = parent;

        /**
         * The Active template
         * @type {FullScreenModalTemplate}
         */
        this.activeTemplate = null;

        /**
         * The node of the template
         * @type {Node}
         */
        this.activeNode = null;
    }

    /**
     * Presents
     * @param {FullScreenModalTemplate} template
     * @param {Object} [opts={}]
     * @param {boolean} [opts.animated=true] - If to animate transition
     */
    async present(template, { animated = true } = {}) {
        if (this.activeTemplate) {
            await this.dismiss({ animated: animated });
        }

        const node = template.loadInContext(this.parent);

        if (animated) {
            const { default: anime } = await import('animejs');
            await anime({
                targets: node,
                opacity: [0, 1],
                elasticity: 0,
                easing: 'easeOutQuart',
                marginTop: ['5%', '0%'],
                duration: 200
            }).finished;
        } else {
            node.opacity = 1;
        }

        this.activeTemplate = template;
        this.activeTemplate.controller = this;
        this.activeNode = node;
    }

    /**
     * Hides
     * @param {Object} [opts={}]
     * @param {boolean} [opts.animated=true] - If to animate transition
     */
    async dismiss({ animated = true } = {}) {
        if (!this.activeTemplate) return;

        if (animated) {
            const { default: anime } = await import('animejs');
            await anime({
                targets: this.activeNode,
                opacity: [1, 0],
                elasticity: 0,
                easing: 'easeOutQuart',
                marginTop: ['0%', '5%'],
                duration: 200
            }).finished;
        } else {
            node.opacity = 0;
        }

        this.activeTemplate.removeFromContext();
        this.activeTemplate.controller = null;
        this.activeTemplate = null;
        this.activeNode = null;

    }
}
