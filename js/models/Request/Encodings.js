import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Gets all encodings as a name. See {@link Encoding.all}
 */
export default class Encoding extends Request {
    /**
     * @param {Object} data
     * @return {Object}
     */
    format(data) {
        return data;
    }

    /**
     * No parameters required
     */
    constructor() {
        super({
            path: `/static/encodings`,
            method: HTTPMethod.GET
        });
    }
}
