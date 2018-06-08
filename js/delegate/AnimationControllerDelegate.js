/**
 * Animatino controller delegate. Responds to animation
 * @interface
 */
export default class ActionControllerDelegate {
    /**
     * @param {ViewController} controller Controller emitting state. Might actually be a template in some cases.
     */
    didStartAnimation(controller) { void 0; }

    /**
     * @param {ViewController} controller Controller emitting state. Might actually be a template in some cases.
     */
    didFinishAnimation(controller) { void 0; }

    /**
     * Called when reverse animation starts
     * @param {ViewController} controller Controller emitting state. Might actually be a template in some cases.
     */
    didUnstartAnimation(controller) { void 0; }

    /**
     * Called when reverse animation finishes
     * @param {ViewController} controller Controller emitting state. Might actually be a template in some cases.
     */
    didUnfinishAnimation(controller) { void 0; }
};
