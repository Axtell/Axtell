import axios from 'axios';

/**
 * Manages authorization use `Auth.shared()` to get global instance
 */
class Auth {
    /**
     * Don't use this. Use `Auth.shared()`
     */
    constructor() {
        this._setup = false;
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
        let userData = await axios.post(
            '/auth/login/jwt',
            authData.json
        );
    }
}

/**
 * @typedef {AuthProfile}
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

Auth.shared = async () => await new Auth().setup();
export default Auth;
