/**
 * Interface for input templates
 * @interface
 */
export default class InputInterface {
    /**
     * Returns observable as value changes
     * @return {Observable}
     */
    observeValue() { return void 0; }

    /**
     * Input element facing user if exists.
     * @type {?HTMLInputElement}
     */
    get userInput() { return void 0; }
}
