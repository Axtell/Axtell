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
     * @param {string} [profile.email] - User email
     * @param {string} [profile.name] - User display name
     */
    constructor({ email, name }) {
        super({
            path: `/preferences/profile`,
            method: HTTPMethod.POST,
            formData: {
                'settings-profile-email': email,
                'settings-profile-displayname': name
            }
        });
    }
}
