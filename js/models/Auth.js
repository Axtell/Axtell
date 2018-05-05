import User from '~/models/User';
import axios from 'axios';

/**
 * Manages authorization use `Auth.shared()` to get global instance
 */
class Auth {
    static Unauthorized = Symbol('Auth.Unauthorized');

    /**
     * Don't use this. Use `Auth.shared()`
     */
    constructor() {
        this._setup = false;
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

        return (async () => (
            Auth._shared = await new Auth().setup()
        ))();
    }

    /**
     * Determines if user is authorized at the moment of call.
     * @return {Boolean} `Promise` but resolves to boolean.
     */
    get isAuthorized() {
        if (this._isAuthorized !== null)
            return Promise.resolve(this._isAuthorized);

        return (async () => (
            this._isAuthorized = await this.user !== Auth.Unauthorized
        ))();
    }

    /**
     * Gets the current user. This does not redo requests and caches the result.
     *
     * @type {Promise<?User>} resolves to the current logged in user. Resolves
     *                          to `Unauthorized` if not logged in.
     */
    get user() {
        // Use cached result
        if (this._user !== null)
            return Promise.resolve(this._user);

        return (async () => {
            const result = await axios.get('/user/data/me');
            const user = User.fromJSON(result.data);

            // Handle unauthorized user
            if (user === null) this._user = Auth.Unauthorized;
            else this._user = user;

            return this._user;
        })();
    }

    /**
     * Logs the given user out. You must reload the pages for changes.
     */
    async logout() {
        await axios.post('/user/logout');
    }

    /**
     * Sets up the authentication object. This will get the user if logged in.
     * This won't run twice and caches its results (will reload when needed).
     * @return {Promise} Resolves to nothing. Resolves when finished.
     */
    async setup() {
        if (this._setup) return;
        this._setup = true;

        return this;
    }

    /**
     * Logs into a code-golf user using a JWT authorization key.
     * @param {AuthData} authData - Authorization data
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
