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
     * Logs into a code-golf user
     * @param  {AuthData}  authData - Authorization data
     * @return {Promise} resolves to a {@link User} of the logged in user.
     */
    async login(authData) {
        let userData = await axios.post(
            '/login',
            authData.json
        );
    }
}

/**
 * Manages data for a login authorization instance
 * @implements {JSONConvertable}
 */
export class AuthData {
    /**
     * @param {string} jwt - Base-64 JWT representing a OpenID auth JSON.
     */
    constructor(authToken) {
        this._authToken = authToken;
    }
    
    /** @override */
    get json() {
        return JSON.stringify({
            token: this._authToken
        })
    }
}

Auth.shared = async () => await new Auth().setup();
export default Auth;
