import User from '~/models/User';
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
        this._user = null;
        
        this._isAuthorized = null;
    }
    
    static Unauthorized = Symbol('Auth.Unauthorized');
    
    /**
     * Gets the current user.
     * @return {Promise<?User>} resolves to the current logged in user. `null`
     *                          if not logged in.
     */
    async getUser() {
        // Use cached result
        if (this._user !== null) return this._user;
        const result = await axios.get('/user/me');
        const user = User.fromJSON(result.data);
        
        // Handle unauthorized user
        if (user === null) this._user = Auth.Unauthorized;
        
        return user;
    }
    
    /**
     * Logs the given user out. You must reload the pages for changes.
     */
    async logout() {
        await axios.post('/user/logout');
    }
    
    /**
     * Determines if user is authorized at the moment of call.
     * @return {Boolean} `Promise` but resolves to boolean.
     */
    get isAuthorized() {
        if (this._isAuthorized !== null)
            return Promise.resolve(this._isAuthorized);
        
        return (async () => (
            this._isAuthorized = await this.getUser() !== Auth.Unauthorized
        ))();
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
    
    /**
     * Returns global instance of `Auth`
     * @type {Auth}
     */
    static get shared() {
        if (Auth._shared !== null) return Promise.resolve(Auth._shared);
        return new Auth().setup();
    }
}
Auth._shared = null;

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

export default Auth;
