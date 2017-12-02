/**
 * Action controller delegate. Controlls action
 * @interface
 */
export default class ActionControllerDelegate {
    /**
     * @param {ViewController} controller Controller emitting state.
     * @param {Object} state Action-specific state object
     */
    didSetStateTo(controller, state) {
        void 0;
    }

    /**
     * Binds an elements value to a state's user-friendly value. Uses
     * {@link State#toString}
     *
     * @param {string|HTMLElement} elem - id or HTMLElement to bind value.
     * @return {Function} Set to the state handler.
     */
    static bindValue(elem) {
        if (typeof elem === 'string') {
            elem = document.getElementById(elem);
        }

        return (controller, state) => {
            elem.value = state.toString();
        };
    }
};
