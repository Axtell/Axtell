/**
 * A class that can be converted to json
 * @interface
 */
export default class JSONConvertable {
    /**
     * Returns a JSON string representing the objcet
     * @return {Object} A losless JSON-convertable object.
     */
    get json() { return ({}); }
}
