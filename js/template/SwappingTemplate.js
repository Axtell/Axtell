import Template from '~/template/Template';
import SwappingViewController from '~/controllers/SwappingViewController';

/**
 * Handles swapping
 */
export default class SwappingTemplate extends Template {
    constructor(root = Template.empty.unique()) {
        super(root);

        /** @type {SwappingViewController} */
        this.controller = new SwappingViewController(root);
    }

    /**
     * Displays alternate
     * @param {Node|Template} alternate
     */
    displayAlternate(alternate) {
        if (alternate instanceof Node) {
            this.controller.displayAlternate(new Template(alternate));
        } else {
            this.controller.displayAlternate(alternate);
        }
    }

    /**
     * Restores original
     */
    restoreOriginal() {
        this.controller.restoreOriginal();
    }
}
