/**
 * Represents an enumeration
 * @implements {JSONSerializable}
 */
export default class Enum {

    /**
     * Creates an enum from an object of Key/ Value pairs
     * @param {Object} object - key to raw value. Keys should be camelCase
     */
    constructor(object) {
        this._data = object;
        Object.assign(this, object);
    }

    /**
     * Converts from **Python** JSON to enumeration
     * @param {Object} json
     * @return {Enum}
     */
    static fromJSON(json) {
        // If exists
        const enumContent = json.enum;

        const validKeys = Object.create(null);
        for (const key in enumContent) {
            if (/^[A-Z0-9_]+$/.test(key)) {
                const [firstPart, ...parts] = key.split('_');
                const suffix = parts.map(part => part[0].toUpperCase() + part.substring(1).toLowerCase()).join("");
                const camelCased = firstPart.toLowerCase() + suffix;

                validKeys[camelCased] = enumContent[key];
            }
        }

        return new Enum(validKeys);
    }

}
