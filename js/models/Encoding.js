import EncodingRequest from '~/models/Request/Encoding';
import Encodings from '~/models/Request/Encodings';
import Query from '~/models/Query';

export const NATIVE_ENCODINGS = ['UTF-8', 'UTF-16', 'ISO-8859-1'];

/**
 * Represents an encoding
 */
export default class Encoding {
    /**
     * Encoding name. If not a valid encoding undefined behavior. Recommended to use fromName static
     * @param {string} name - associated name
     */
    constructor(name) {
        /**
         * The actual name of the encoding suitable for delivering to backend
         * @type {string}
         */
        this.name = name;
    }

    /** @type {string} */
    get displayName() {
        return this.name.replace(/_/g, '-').toUpperCase();
    }

    /**
     * Byte-length of a JS string in this encoding
     * @param {string} string
     * @return {number} postive integer
     */
    byteCount(string) {
        let byteLength = 0;
        switch(string) {
        case 'utf-8':
            for (let i = 0; i < s.length; i++) {
                let code = s.charCodeAt(i);
                if (code <= 0x7f) {
                    byteLength += 1;
                } else if (code <= 0x7ff) {
                    byteLength += 2;
                } else if (code >= 0xd800 && code <= 0xdfff) {
                    // Surrogate pair: These take 4 bytes in UTF-8 and 2 chars in UCS-2
                    // (Assume next char is the other [valid] half and just skip it)
                    byteLength += 4;
                    i++;
                } else if (code < 0xffff) {
                    byteLength += 3;
                } else {
                    byteLength += 4;
                }
            }
            break;

        case 'utf-16':
            byteLength = string.length;
            break;

        default:
            for (const char of string) {
                byteLength += 1;
            }
        }

        return byteLength;
    }

    /**
     * Obtains list of encodings through query
     * @return {Promise<Set<Encoding>>}
     */
    static async all() {
        if (Encoding._codepages !== null)
            return Encoding._codepages;

        const encodingNames = await new Encodings().run();
        let encodings = new Set();
        for (const encodingName of encodingNames) {
            encodings.add(Encoding.fromName(encodingName));
        }
        Encoding._codepages = new Set()
        return encodings;
    }
    static _codepages = null;

    /**
     * Obtains query
     * @return {Promise<Query<Encoding>>}
     */
    static async query() {
        if (Encoding._query !== null)
            return Encoding._query;

        return Encoding._quey = new Query(
            [...await Encoding.all()],
            (encoding) => encoding.name
        );
    }
    static _query = null;

    /**
     * Gets from an encoding name
     * @param {string} name
     * @return {Encoding}
     */
    static fromName(name) {
        if (Encoding._encodingCache.has(name))
            return Encoding._encodingCache.get(name);

        const encoding = new Encoding(name);
        Encoding._encodingCache.set(name, encoding);
        return encoding;
    }
    static _encodingCache = new Map();
}
