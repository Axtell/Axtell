import User from '~/models/User';
import Data from '~/models/Data';
import { Bugsnag } from '~/helpers/Bugsnag';
import axios from 'axios/dist/axios.min.js';

import ModalController from '~/controllers/ModalController';
import AuthModalTemplate from '~/template/login/AuthModalTemplate';

/**
 * Manages authorization use `Auth.shared()` to get global instance
 */
class Auth {
    static Unauthorized = Symbol('Auth.Unauthorized');

    /**
     * Don't use this. Use `Auth.shared()`
     */
    constructor() {
        this._user = null;

        this._isAuthorized = null;
    }

    /**
     * Returns global instance of `Auth`
     * @type {Auth}
     */
    static get shared() {
        if (Auth._shared !== null)
            return Promise.resolve(Auth._shared);

        return (async () => {
            const auth = new Auth();
            const user = auth.user;
            Auth._shared = auth;

            // Since now that the auth it setup, we'll setup bugsnag user info
            if (Bugsnag) {
                if (user !== Auth.Unauthorized) {
                    Bugsnag.user = {
                        authorized: true,
                        id: user.id,
                        name: user.name
                    };
                } else {
                    Bugsnag.user = {
                        authorized: false
                    };
                }
            }

            return auth;
        })();
    }

    /**
     * Determines if user is authorized at the moment of call.
     * @return {Boolean} this is sync
     */
    get isAuthorized() {
        return Data.shared.hasKey('me');
    }

    /**
     * Gets the current user.
     *
     * @type {?User} the current logged in user. Resolves to `Unauthorized` if
     *               not logged in.
     */
    get user() {
        if (this.isAuthorized) {
            const value = Data.shared.encodedJSONForKey('me');
            return User.fromJSON(value);
        } else {
            return Auth.Unauthorized;
        }
    }

    /**
     * Logs the given user out. You must reload the pages for changes.
     */
    async logout() {
        await axios.post('/user/logout');
    }

    /**
     * Ensures the user is logged in.
     * @param {?string} reason Why this is being ensured.
     * @return {boolean} `false` is user refused to login and is not logged in.
     */
    async ensureLoggedIn(reason = null) {
        if (this.isAuthorized) return true;

        alert('You must be logged in to continue using this feature. (note: this is a temporary alert, will be replaced later)');
        return false;
    }

    /**
     * Logs into a code-golf user using a JWT authorization key.
     * @param {AuthJWTToken} authData - Authorization data
     * @return {Promise} resolves to a {@link User} of the logged in user.
     */
    async loginJWT(authData) {
        await axios.post(
            '/auth/login/jwt',
            authData.json
        );
    }
}

Auth._shared = null;

/**
 * @typedef {Object} AuthProfile
 * @property {string} email
 * @property {string} name
 * @property {?string} avatar
 */

/**
 * Manages data for a login authorization instance
 * @implements {JSONConvertable}
 */
export class AuthJWTToken {
    /**
     * @param {string} jwt - Base-64 JWT representing a OpenID auth JSON.
     * @param {AuthProfile} profile - Profile information
     */
    constructor(authToken, profile) {
        this._authToken = authToken;
        this._profile = profile;
    }

    /** @override */
    get json() {
        return {
            token: this._authToken,
            profile: this._profile
        };
    }
}

export default Auth;
