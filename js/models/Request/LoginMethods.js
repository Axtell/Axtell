import Request, { HTTPMethod } from '~/models/Request/Request';
import LoginMethod from '~/models/LoginMethod';

/**
 * Returns list of login methods
 * @extends {Request}
 */
export default class LoginMethods extends Request {
    /**
     * Returns login method array
     * @param {Object} data
     * @return {Object[]}
     */
    format(data) {
        return data.methods.map(method => LoginMethod.fromJSON(method));
    }

    /**
     * Requires auth
     */
    constructor() {
        super({
            path: `/auth/methods/list`,
            method: HTTPMethod.GET
        });
    }
}
