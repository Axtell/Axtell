import ErrorManager from '~/helpers/ErrorManager';

export const NO_DATA_TAG = Symbol('Data.Error.NoDataTag');

/**
 * A global key (not env related).
 * @typedef {Object} Key
 * @property {string} helpCenter - Object for help center page data.
 * @property {string} settingsContext - If is user settings screen
 * @property {string} userEmail - The email of the user
 * @property {string} loginData - OAuth datas ONLY available when not logged in.
 * @property {string} userReceiveNotifications - If user wants notifications
 */
export const Key = {
    helpCenter: 'helpCenter',
    settingsContext: 'settingsContext',
    userEmail: 'userEmail',
    loginData: 'loginData',
    userReceiveNotifications: 'userReceiveNotifications'
};

/**
 * An env key. These are constant over a server's instance
 * @typedef {Object} EnvKey
 * @property {string} algoliaAppId - app id for algolia
 * @property {string} algoliaSearchKey - search key for algolia
 * @property {string} csrf - CSRF token
 * @property {string} isDebug - If is debugging instance
 * @property {string} host - canonical host
 * @property {string} webAPNId - The web.id of webapns
 * @property {string} minUsernameLength - minimum username length
 * @property {string} maxUsernameLength - maximum username length
 */
export const EnvKey = {
    algoliaAppId: 'ALGOLIA_APP_ID',
    algoliaSearchKey: 'ALGOLIA_SEARCH_KEY',
    csrf: 'CSRF',
    host: 'HOST',
    indexPrefix: 'INDEX_PREFIX',
    isDebug: 'IS_DEBUG',
    webAPNId: 'WEB_APN_ID',
    minUsernameLength: 'MIN_USERNAME_LENGTH',
    maxUsernameLength: 'MAX_USERNAME_LENGTH',
};

/**
 * Manages data passed from server-side
 */
export default class Data {
    static shared = new Data('data_id');

    /**
     * @param {string} dataId name of meta data-id tag.
     */
    constructor(dataId) {
        let tag = document.getElementsByTagName('meta')[dataId];

        if (!tag) {
            ErrorManager.raise(`No data id tag found`, NO_DATA_TAG);
        }

        this._id = tag.content;
    }

    /**
     * JS server data exchange identification.
     * @type {string}
     */
    get dataId() {
        return this._id;
    }

    /**
     * Gets base64 json for key
     * @param {string} key - Key name
     * @return {?Object}
     */
    encodedJSONForKey(key) {
        const value = this.valueForKey(key);
        if (value === null) return null;
        else return JSON.parse(value);
    }

    _envCache = null;
    /**
     * Obtains a server-sources env value
     * @param  {string} key The key
     * @return {?any} null if not found
     */
    envValueForKey(key) {
        const env = this._envCache || (this._envCache = this.encodedJSONForKey("env"));
        return env[key];
    }

    /** @private */
    keyNameForKey(key) {
        return `data-${this._id}:${key}`;
    }

    /**
     * Check if key exists
     * @param {string} key
     * @return {boolean} true if exists
     */
    hasKey(key) {
        return !!document.getElementsByTagName('meta')[this.keyNameForKey(key)];
    }

    /**
     * Get value for key
     * @param {string} key - Key name
     * @return {?string}
     */
    valueForKey(key) {
        return document.getElementsByTagName('meta')[this.keyNameForKey(key)]?.content || null;
    }
}
