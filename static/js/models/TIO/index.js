import axios from 'axios';
import languages from '@/languages.json';

/**
 * Manages Try It Online execution
 */
export default class TIO {
    /**
     * Use {@link TIO.shared} instead of this.
     * @private
     */
    constructor() {
        this.data = null;
    }
    
    /**
     * Loads TIO data.
     * @private
     */
    async _init() {
        console.log(languages);
    }
    
    /**
     * Returns global instance of `Auth`
     * @type {Promise<Auth>}
     */
    static get shared() {
        if (TIO._shared !== null) return Promise.resolve(TIO._shared);
        return new TIO()._init();
    }
}
TIO._shared = null;
