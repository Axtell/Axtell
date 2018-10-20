/**
 * Manages location hashes.
 */
export default class HashManager {

    /**
     * Global object
     * @type {HashManager}
     */
    static shared = new HashManager();

    /**
     * Takes no args
     */
    constructor() {
        // Attempt to get current hash
        const currentHash = window.location.hash.slice(1);

        // Attempt to decode
        let existingData;
        try {
            existingData = JSON.parse(Buffer.from(currentHash, 'base64').toString('utf8'));
        } catch(error) {
            existingData = {};
        }

        this.state = existingData;
    }

    /**
     * Updates the state to store a new key
     * @param {string} key
     * @param {string} value
     */
    setContextValue(key, value) {
        this.state[key] = value;
        this.resyncHash();
    }

    /**
     * Obtains the value of a key
     * @param {string} key
     * @return {?string}
     */
    getContextValue(key) {
        return this.state[key];
    }

    /**
     * You shouldn't need to call this but it updates the hash in the URL
     */
    resyncHash() {
        window.location.hash = Buffer.from(JSON.stringify(this.state)).toString('base64');
    }

}
