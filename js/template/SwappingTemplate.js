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
}
