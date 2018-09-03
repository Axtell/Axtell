import Request, { HTTPMethod } from '~/models/Request/Request';

const cache = new Map();

/**
 * Obtains an encoding
 * @extends {Request}
 */
export default class Encoding extends Request {
    /**
     * Returns the encoding data. Use {@link Encoding} to auto call this
     * @param {Object} data
     * @return {Object}
     */
    format(data) {
        return data[this.encodingName];
    }

    /**
     * @param {string} encoding
     */
    constructor(encoding) {
        super({
            path: `/encodings/mapping/${encoding}`,
            method: HTTPMethod.GET
        });

        /** @private */
        this.encodingName = encoding;
    }
}
