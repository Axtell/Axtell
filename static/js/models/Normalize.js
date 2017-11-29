/**
 * List of common words
 * @type {string[]}
 */
export const CommonList = [
    "the", "of", "a", "an"
]

/**
 * Normalizes strings. This handles all sorts of different types of
 * normalization. Pass it a string and use a function to normalize it in some
 * way. Calling a function does not have side-effects
 */
export default class Normalize {
    /**
     * Creates a normalizer for a string which all operations will operate on.
     * @param {string} string string to normalize.
     */
    constructor(string) {
        /** @type {string} */
        this.string = string;
    }

    /**
     * Standardizes a string to a simple non-variable format. DOES modify
     * whitespace.
     *
     * @return {string} new standardized string
     */
    standardize() {
        return this.string.trim().replace(/\s+/g, ' ');
    }

    /**
     * Returns query terms for a given string
     * @param {string[]} [common=CommonList] list of common words to strip.
     *                                       see CommonList global.
     * @return {string[]} list of query terms
     */
    queryTerms(common = CommonList) {
        let terms = this
            .standardize()
            .toLowerCase()
            .split(' ')
            .filter(term => !CommonList.includes(term));

        return terms;
    }
}
