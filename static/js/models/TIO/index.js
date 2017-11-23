import axios from 'axios';
import ErrorManager from '~/helper/ErrorManager';

const TIO_LANGUAGES = 'https://tio.run/languages.json';

/**
 * Manages Try It Online execution
 */
export default class TIO {
    /**
     * Use {@link TIO.shared} instead of this.
     * @private
     */
    constructor() {
        this.langData = null;
    }
    
    /**
     * Loads TIO data from TIO. This will store them in the singleton which you
     * can access. Most other things are unchecked however so verify with the
     * local languages.json what capabilities are.
     *
     * @private
     */
    async init() {
        // Nothing here for now but just for future-proofing
        return this;
    }
    
    /**
     * Returns global instance of `Auth`
     * @type {Promise<Auth>}
     */
    static get shared() {
        if (TIO._shared !== null) return Promise.resolve(TIO._shared);
        return new TIO().init();
    }
}
TIO._shared = null;
