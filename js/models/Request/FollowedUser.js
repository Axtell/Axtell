import { HTTPMethod } from '~/models/Request/Request';
import PagedRequest from '~/models/Request/PagedRequest';
import User from '~/models/User';

/**
 * @typedef {Object} FollowedType
 * @property {Object} following
 * @property {Object} followers
 */
export const FollowedType = {
    following: 'following',
    followers: 'followers'
};

/**
 * Gets both **followed and following** users.
 */
export default class FollowedUser extends PagedRequest {
    /** @override */
    format(users) {
        return users.map(User.fromJSON);
    }

    /**
     * **Requires** authorization
     * @param {User} user - The user to lookup
     * @param {FollowedType} followedType - The type of following
     */
    constructor(user, followedType) {
        super({
            path: `/user/${user.id}/${followedType}`,
            method: HTTPMethod.GET
        });

        /**
         * The user target of the request
         * @type {User}
         */
        this.user = user;
    }
}
