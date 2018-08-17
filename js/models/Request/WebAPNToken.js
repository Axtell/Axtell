import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Gets WebAPN Token
 */
export default class WebAPNToken extends Request {
    /** @override */
    format(object) {
        return object.token;
    }

    /**
     * **Requires** authorization.
     */
    constructor() {
        super({
            path: `/webapn/get_identification`,
            method: HTTPMethod.POST
        });
    }
}
