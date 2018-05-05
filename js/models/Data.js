import ErrorManager from '~/helpers/ErrorManager';

export const NO_DATA_TAG = Symbol('Data.Error.NoDataTag');

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
        else return JSON.parse(atob(value));
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

    /**
     * Get value for key
     * @param {string} key - Key name
     * @return {?string}
     */
    valueForKey(key) {
        return window[this._id + key] || null;
    }
}
