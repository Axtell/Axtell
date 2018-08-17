/**
 * Represents an enumeration
 * @implements {JSONSerializable}
 */
export default class Enum {

    /**
     * Creates an enum from an object of Key/ Value pairs
     * @param {Object} object - key to raw value. Keys should be camelCase should
     *                        also be plain object not checked for inheritance.
     */
    constructor(object) {
        this._data = Object.create(null);

        for (const key in object) {
            this._data[object[key]] = key;
        }

        Object.assign(this, object);
    }

    /**
     * Obtains key name for value (camel case)
     * @param {any} value - The enum value
     */
    keyForValue(value) {
        return this._data[value];
    }

    /**
     * Attempts to create human-readable name from
     * enum key.
     * @param {any} value - The enum value
     */
    descriptionForValue(value) {
        const key = this.keyForValue(value);
        return key.replace(/([a-z])([A-Z])/g, "$1 $2")
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
