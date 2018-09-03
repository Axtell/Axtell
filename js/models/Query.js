import Normalize from '~/models/Normalize';
import { Searcher } from 'fast-fuzzy';

/**
 * Represents a searchable index/object.
 */
export default class Query {
    /**
     * Creates a QueryList from a formatted map. Use {@link QueryList.from}
     * methods to construct this. You may not need to use such a complex
     * formatting for simpler (e.g. letter) queries.
     *
     * @param {T[]} items List of all items
     * @param {Function} pred Returns search value for given object
     */
    constructor(items, pred) {
        /** @private */
        this.searcher = new Searcher(
            items,
            { keySelector: pred }
        );
    }

    /**
     * Returns candidate list for a given query term. Uses fuzzy non-repetitive
     * letter matching.
     *
     * @param {string} term Term to search for
     * @return {T[]} the candidate objects.
     */
    find(term) {
        return this.searcher.search(term);
    }

    /**
     * Does a paged search
     * @param {string} term
     * @param {Object} [opts={}]
     * @param {number} [opts.maxResults=5] - Max results
     * @param {number} [opts.page=1] - one-indexed
     * @param {boolean} [opts.searchEmpty=true] - If to query empty
     * @return {Object}
     * @property {T[]} results
     * @property {boolean} areMore If are more
     */
    findPage(term, { maxResults = 5, page = 1, searchEmpty = true } = {}) {
        if (!searchEmpty && !term) return null;

        const results = this.searcher.search(term);

        const startIndex = maxResults * (page - 1);
        const endIndex = startIndex + maxResults;

        const areMore = results.length > endIndex;
        return { results: results.slice(startIndex, endIndex), areMore }
    }
}
