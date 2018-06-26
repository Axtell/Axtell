/**
 * Delegate for items which are opened/closed
 */
export default class NavigationItemDelegate {
    /**
     * Should be closed
     * @param {ViewController|Template} controller
     * @param {Object} context Some contextual data
     */
    shouldClose(controller, context) { void 0; }

    /**
     * Should be opened
     * @param {ViewController|Template} controller
     * @param {Object} context Some contextual data
     */
    shouldOpen(controller, context) { void 0; }
}
