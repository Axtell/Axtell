/**
 * Interface for input templates
 * @interface
 */
export default class InputInterface {
    /**
     * Input element backing actual value
     * @type {HTMLInputElement}
     */
    get input() { return void 0; }

    /**
     * Input element facing user if exists
     * @type {HTMLInputElement}
     */
    get userInput() { return void 0; }
}
