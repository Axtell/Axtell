import Normalize from '~/models/Normalize';

/**
 * Represents a searchable index/object.
 */
export default class Query {
    /**
     * Creates a QueryList from a formatted map. Use {@link QueryList.from}
     * methods to construct this. You may not need to use such a complex
     * formatting for simpler (e.g. letter) queries.
     *
     * @param {Map<String, T[]>} map List of a term and subsequent matchings.
     */
    constructor(map) {
        this._map = map;
    }

    /**
     * Returns candidate list for a given query term. Uses fuzzy non-repetitive
     * letter matching.
     *
     * @param {string} term Term to search for
     * @param {number} [limit=Infinity] positive number repesenting maximium
     *                                  number of terms to return. This number
     *                                  may be exceeed in return.
     * @param {number} [threshold=0.8] number of letters that must exactly match
     *                                 for a term to be matched.
     * @return {QueryResult[]} the candidate objects.
     */
    find(term, limit = Infinity, threshold = 0.8) {
        // format { score: number, value: T }
        let candidates = [];
        let termLength = term.length;

        for (let [termName, values] of this._map) {
            let matchedIndices = [];

            match:
            for (let letter of term) {
                let index;
                do {
                    index = termName.indexOf(letter);
                    if (index === -1) continue match;
                } while(matchedIndices.includes(index));
                matchedIndices.push(index);
            }

            let score = matchedIndices.length / termLength;
            if (score > threshold) {
                candidates.push({
                    score: score,
                    value: values
                })
            }

            if (candidates.length >= limit) break;
        }

        // Sort based on score
        return candidates.sort((a, b) => b.score - a.score);
    }

    /**
     * Performs multiple queries of a search string with {@link Query#find}.
     *
     * @param {string} string Term to search for
     * @param {Function} comp Determines if two values are equal.
     * @param {number} [limit=Infinity] positive number repesenting maximium
     *                                  number of terms to return. This number
     *                                  may be exceeed in return.
     * @param {number} [threshold=0.8] number of letters that must exactly match
     *                                 for a term to be matched.
     * @return {QueryResult[]} the candidate objects.
     */
    normalizedFind(string, comp, limit, threshold) {
        let terms = new Normalize(string).queryTerms(),
            termIndex = terms.length;

        if (terms.length === 0) return [];

        let matches = this.find(terms[--termIndex], limit, threshold);

        while (--termIndex) {
            let results = this.find(terms[termIndex], limit, threshold),
                resultCount = results.length;

            addResult:
            while (--resultCount) {
                let result = results[resultCount];
                let matchLength = matches.length;

                while (--matchLength) {
                    if (comp(matches[matchLength], result)) continue addResult;
                }

                matches.push(result);
            }
        }

        return matches.sort((a, b) => b.score - a.score);
    }
}

/**
 * @typedef {Object} QueryResult
 * @property {number} score - (0, 1] of how well the given value matched the
 *                          search term
 * @property {T} value - The matched value (array of matches).
 */
