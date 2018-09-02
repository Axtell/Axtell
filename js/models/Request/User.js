import Request, { HTTPMethod } from '~/models/Request/Request';
import User from '~/models/User';

// Object of [user id] to User objects
const userCache = {};

/**
 * Obtains a User by ID. This _does_ cache
 * @extends {Request}
 */
export default class UserRequest extends Request {
    /**
     * Returns User object
     * @param {Object} data
     * @return {User}
     */
    format(data) {
        const user = User.fromJSON(data);
        userCache[user.id] = user;
        return user;
    }

    /** @override */
    async run() {
        return userCache[this.id] || await super.run();
    }

    /**
     * Obtains user profile by id
     * @param {number} id
     */
    constructor({ id }) {
        super({
            path: `/users/data/${id}`,
            method: HTTPMethod.GET
        });

        /** @private */
        this.id = id;
    }
}
