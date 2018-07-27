import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Follows **or unfollows** a user. This updates the state
 */
export default class FollowUser extends Request {
    /** @override */
    format(object) {
        this.user.isFollowing = object.following;
    }

    /**
     * **Requires** authorization
     * @param {User} user - The user to follow.
     * @param {Object} opts
     * @param {boolean} [opts.shouldFollow=true] - what the resulting follow status should be
     */
    constructor(user, { shouldFollow = true }) {
        const action = shouldFollow ? 'follow' : 'unfollow';

        super({
            path: `/user/${user.id}/${action}`,
            method: HTTPMethod.POST
        });

        /**
         * The user target of the request
         * @type {User}
         */
        this.user = user;
    }
}
