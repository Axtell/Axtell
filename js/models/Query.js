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
}
