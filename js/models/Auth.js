import User from '~/models/User';
import Data, { Key } from '~/models/Data';
import { Bugsnag } from '~/helpers/Bugsnag';
import axios from 'axios/dist/axios.min.js';

import ModalController from '~/controllers/ModalController';
import AuthModalTemplate from '~/template/login/AuthModalTemplate';

import { from, fromEvent } from 'rxjs/index';
import { filter, first, map, tap } from 'rxjs/operators';

const oauthData = Data.shared.encodedJSONForKey(Key.loginData);

/**
 * @typedef {Object} AuthConfig
 * @property {boolean} [append=false] - If logged in, append to current user.
 */

/**
 * Manages authorization use `Auth.shared()` to get global instance
 */
class Auth {
    static Unauthorized = Symbol('Auth.Unauthorized');

    /**
     * OAuth endpoint
     * @param {string} site - Site ID
     * @param {Object} options
     * @param {boolean} [options.clientOnly=false] - A boolean specifying it to use client flow.
     * @param {AuthConfig} [options.authConfig={}] - authorization config
     * @return {string} URL to put into link
     */
    static oauthEndpointForSite(site, { clientOnly = false, authConfig = {} } = {}) {
        const siteData = oauthData.sites[site];
        const options = {
            provider: site,
            redirect: location.href,
            clientOnly: clientOnly,
            authConfig: authConfig
        };

        return `${siteData.authorize}?${Object.entries({
            client_id: siteData.client,
            scope: siteData.scopes.join(" "),
            state: Buffer.from(JSON.stringify(options)).toString('base64'),
            redirect_uri: oauthData.redirect_uri,
            response_type: 'code'
        }).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`;
    }

    /**
     * Authorizes for an OAuth site with auth config using CLIENT flow.
     * @param {string} site - site ID
     * @param {Object} [options] - Options for {@link Auth.oauthEndpointForSite}
     * @return {Promise<string>} Resolves to auth key.
     * @async
     */
    authorizeOAuth(site, options = {}) {
        return new Promise((resolve, reject) => {
            const endpoint = Auth.oauthEndpointForSite(site, options);

            // If we're using a server side flow then we'll stick to that
            if (!options.clientOnly) {
                window.location.href = endpoint;
                return;
            }

            const authWindow = window.open(endpoint, `Login to Axtell`, 'width=800,height=800,toolbar=0,menubar=0');

            fromEvent(window, 'message')
                .pipe(
                    filter(event => event.source === authWindow),
                    map(event => event.data || {}),
                    filter(data => data.oauth),
                    first(),
                    map(data => data.success),
                    tap(() => authWindow.postMessage({ received: true }, '*')))
                .subscribe(isAuthorizationSuccess => {
                    console.log(isAuthorizationSuccess);
                    if (isAuthorizationSuccess) {
                        resolve();
                    } else {
                        reject();
                    }
                });
        });
    }

    /**
     * Don't use this. Use `Auth.shared()`
     */
    constructor() {
        this._user = null;

        this._isAuthorized = null;
    }

    /**
     * Returns global instance of `Auth`
     * @type {Promise<Auth>}
     */
    static get shared() {
        if (Auth._shared !== null)
            return Auth._shared;

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
     * @param {Object} options - auth options
     */
    constructor(authToken, profile, options) {
        this._authToken = authToken;
        this._profile = profile;
        this._options = options;
    }

    /** @override */
    get json() {
        return {
            token: this._authToken,
            profile: this._profile,
            authConfig: this._options
        };
    }
}

export default Auth;
