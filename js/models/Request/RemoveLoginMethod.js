import Request, { HTTPMethod } from '~/models/Request/Request';
import LoginMethod from '~/models/LoginMethod';

/**
 * Removes methods
 * @extends {Request}
 */
export default class RemoveLoginMethod extends Request {

    /**
     * @param {LoginMethod|number} method - login method or ID
     */
    constructor(method) {
        super({
            path: `/auth/method/${typeof method === 'number' ? method : method.id}/remove`,
            method: HTTPMethod.POST
        });
    }
}
