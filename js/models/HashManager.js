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
        const currentHash = window.location.hash.substring(1);
        const parts = currentHash.substring(1).split("?");

        // Attempt to decode URI
        let navigationSection,
            contextSection;

        if (currentHash[0] !== '!') {
            navigationSection = "";
            contextSection = "";
        } else {
            [navigationSection = "", contextSection = ""] = parts;
        }

        let existingData = new Map(),
            existingNavigation = [];

        if (navigationSection) {
            existingNavigation = navigationSection.substring(1).split('/');
        }

        if (contextSection) {
            existingData = new Map(contextSection.split('&')
                .map(entry => entry.split('='))
                .filter(entry => entry.length !== 2)
                .map((parts) => parts.map(decodeURIComponent)));
        }

        this.state = existingData;
        this.navigation = existingNavigation;
    }

    /**
     * Updates the state to store a new key
     * @param {string} key
     * @param {string} value
     */
    setContextValue(key, value) {
        this.state.set(key, value);
        this.resyncHash();
    }

    /**
     * Sets the navigation key. If depth is greater than supported than empty.
     * @param {number} depth - navigation item depth.
     * @param {string} position - navigation string value
     */
    setNavigationValue(depth, position) {
        this.navigation[depth] = position;
        this.resyncHash();
    }

    /**
     * Gets navigation value for depth
     * @param {number} depth - navigation item depth
     * @return {string} position string
     */
    getNavigationValue(depth) {
        return this.navigation[depth];
    }

    /**
     * Obtains the value of a key
     * @param {string} key
     * @return {?string}
     */
    getContextValue(key) {
        return this.state.get(key);
    }

    /**
     * Returns string representing navigation hash
     * @type {string}
     */
    get locationHash() {
        if (this.navigation.length === 0) return '';

        return `/${this.navigation.join("/")}`;
    }

    /**
     * Gets hash repesenting value
     */
    get valueHash() {
        const entries = [...this.state.entries()];

        if (entries.length === 0) return '';

        return '?' + entries
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
    }

    /**
     * Returns string representing
     * @return {string}
     */
    get hash() {
        const hash = this.locationHash + this.valueHash;
        if (hash === '') return '';
        return '!' + hash;
    }

    /**
     * You shouldn't need to call this but it updates the hash in the URL
     */
    resyncHash() {
        window.location.hash = this.hash;
    }

}
