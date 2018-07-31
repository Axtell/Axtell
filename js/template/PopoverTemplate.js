import Template from '~/template/Template';
import Cross from '~/svg/Cross';

export default class PopoverTemplate extends Template {
    /**
     * Creates popover template given body
     * @param {HTMLElement} body - The body of the popover
     * @param {Object} [options={}] - The options of the popover
     * @param {boolean} [options.isFixed=false] - If to use a responsive full-width
     * @param {boolean} [options.isAlignedRight=false] - Align rightward
     * @param {boolean} [options.hasResponsiveClose=false] - Responsive close button
     */
    constructor(body, {
        isFixed = false,
        isAlignedRight = false,
        hasResponsiveClose = false
    } = {}) {
        const responsiveClose = hasResponsiveClose ? (
            <a class="popover__close popvc__untrigger">
                { Cross.cloneNode(true) }
                <span>close</span>
            </a>
        ) : <DocumentFragment/>;

        const root = (
            <div class="popover">
                { responsiveClose }
                { body }
            </div>
        );

        super(root);

        this.defineLinkedClass('isFixed', 'popover--responsive-fixed');
        /**
         * If the node has fixed full-width in responsive
         * @type {boolean}
         */
        this.isFixed = isFixed;

        this.defineLinkedClass('isAlignedRight', 'popover--align-rightward');
        /**
         * Align rightward
         * @type {boolean}
         */
        this.isAlignedRight = isAlignedRight;
    }
}
