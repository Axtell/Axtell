import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Gets all encodings as a name. See {@link Encoding.all}
 */
export default class Encoding extends Request {
    /**
     * @param {Object} data
     * @return {string[]}
     */
    format(data) {
        return data.encodings;
    }

    /**
     * No parameters required
     */
    constructor() {
        super({
            path: `/encodings/all`,
            method: HTTPMethod.GET
        });
    }
}
