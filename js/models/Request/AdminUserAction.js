import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * List of possible admin user actions.
 * @typdef {Object} AdminUserAction
 * @property {Object} nuke
 * @property {Object} resetVotes
 */
export const AdminUserActionType = {
    nuke: { path: 'nuke', method: HTTPMethod.DELETE },
    resetVotes: { path: 'reset_votes', method: HTTPMethod.POST },
};

/**
 * Performs an admin user action
 * @extends {Request}
 */
export default class AdminUserAction extends Request {
    /**
     * **Requires** authorization and admin
     * @param {User} user - The user to perform on.
     * @param {AdminUserActionType} action - The action to do
     */
    constructor(user, action) {
        super({
            path: `/user/${action.path}/${user.id}`,
            method: action.method
        });
    }
}
