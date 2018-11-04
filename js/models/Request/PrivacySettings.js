import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Obtains privacy settings
 * @extends {Request}
 */
export default class PrivacySettings extends Request {
    /** @override */
    format(json) {
        return {
            followingIsPublic: json.following_is_public,
            linkedStackexchangeIsPublic: json.linked_stackexchange_is_public
        };
    }

    /**
     * **Requires** authorization
     */
    constructor() {
        super({
            path: `/preferences/privacy`,
            method: HTTPMethod.GET
        });
    }
}
