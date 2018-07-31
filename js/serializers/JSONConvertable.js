/**
 * A class that can be converted to json
 * @interface
 */
export default class JSONConvertable {
    /**
     * Returns a JSON string representing the objcet
     * @return {Object} A lossless JSON-convertable object.
     */
    toJSON() { return ({}); }

    /**
     * Converts a provided object to JSON.
     * @param {Object} json
     * @return {T} The object from a json object
     */
    static fromJSON() { return null; }
}
