import ErrorManager from '~/helper/ErrorManager';

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
     * @return {string}
     */
    get dataId() {
        return this._id;
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
