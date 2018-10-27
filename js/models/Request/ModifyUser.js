import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Adjusts user config
 */
export default class ModifyUser extends Request {
    /** @override */
    format(object) {
        return null;
    }

    /**
     * **Requires** authorization
     * @param {Object} profile
     * @param {?string} profile.email - User email
     * @param {?string} profile.name - User display name
     * @param {?boolean} profile.followingIsPublic - If following is public
     */
    constructor({ email = null, name = null, followingIsPublic = null }) {
        const opts = {};

        if (email !== null) opts['settings-profile-email'] = email;
        if (name !== null) opts['settings-profile-displayname'] = name;
        if (followingIsPublic !== null) opts['settings-privacy-public-following'] = followingIsPublic;

        super({
            path: `/preferences/profile`,
            method: HTTPMethod.POST,
            data: opts
        });
    }
}
