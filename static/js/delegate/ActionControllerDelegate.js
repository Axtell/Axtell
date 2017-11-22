/**
 * Action controller delegate. Controlls action
 * @interface
 */
export default class ActionControllerDelegate {
    /**
     * @param {Object} state Action-specific state object
     * @param {ViewController} controller Controller emitting state.
     */
    didSetStateTo(state, controller) {
        void 0;
    }
};
