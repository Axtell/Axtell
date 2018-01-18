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
     * @param {Function?} comp Comparator function, checks equality.
     */
    constructor(map, comp) {
        this._map = map;
        this._comp = comp;
    }

    /**
     * Returns candidate list for a given query term. Uses fuzzy non-repetitive
     * letter matching.
     *
     * By the way I have no idea how this works but it kinda sorta takes the
     * terms and gives it points for having each character. If the characters
     * are in the right position it'll get a bonus.
     *
     *
     * @param {string} term Term to search for
     * @param {number} [limit=Infinity] positive number repesenting maximium
     *                                  number of terms to return. This number
     *                                  may be exceeed in return.
     * @param {number} [threshold=0.8] number of letters that must exactly match
     *                                 for a term to be matched.
     * @param {boolean} sort - if to sort results by score.
     * @return {QueryResult[]} the candidate objects.
     */
    find(term, limit = Infinity, threshold = 0.8, sort = true) {
        // format { score: number, value: T }
        let candidates = [],
            bonus = 0;

        if (term.length === 0) return [];

        querySearch:
        for (let [termName, values] of this._map) {
            let matchedIndices = [];

            match:
            for (let i = 0; i < term.length; i++) {
                let index = -1,
                    letter = term[i];

                do {
                    index = termName.indexOf(letter, index + 1);
                    if (index === -1) continue match;
                    if (index === i) bonus += 1 / term.length;
                } while(matchedIndices.includes(index));
                matchedIndices.push(index);
            }

            let score = matchedIndices.length / term.length;
            if (score > threshold) {
                // Check if already exists
                for (let i = 0; i < candidates.length; i++) {
                    if (this._comp(candidates[i].value, values)) {
                        candidates[i].score = Math.max(candidates[i].score, score);
                        continue querySearch;
                    }
                }

                candidates.push({
                    score: score + bonus,
                    indices: matchedIndices,
                    termLength: term.length,
                    term: term,
                    value: values
                });
            }
        }

        // Sort based on score
        if (sort === true) {
            return candidates.sort((a, b) => b.score - a.score).splice(0, limit);
        } else {
            return candidates.splice(0, limit);
        }
    }

    /**
     * Performs multiple queries of a search string with {@link Query#find}.
     *
     * @param {string} string Term to search for
     * @param {number} [limit=Infinity] positive number repesenting maximium
     *                                  number of terms to return. This number
     *                                  may be exceeed in return.
     * @param {number} [threshold=0.8] number of letters that must exactly match
     *                                 for a term to be matched.
     * @param {boolean} sort - if to sort the results
     * @return {QueryResult[]} the candidate objects.
     */
    normalizedFind(string, limit, threshold, sort = true) {
        let terms = new Normalize(string).queryTerms([]);

        if (terms.length === 0) return [];

        let matches = this.find(terms[0], Infinity, threshold, false);

        for (let i = 1; i < terms.length; i++) {
            let results = this.find(terms[i], Infinity, threshold, false);

            addResult:
            for (let j = 0; j < results.length; j++) {
                let result = results[j];

                for (let k = 0; k < matches.length; k++) {
                    if (this._comp(matches[k].value, result.value)) {
                        // Check which has higher score
                        matches[k].score = Math.max(matches[k].score, result.score);
                        continue addResult;
                    }
                }

                matches.push(result);
            }
        }

        if (sort === true) {
            return matches.sort((a, b) => b.score - a.score).splice(0, limit);
        } else {
            return matches.splice(0, limit);
        }
    }
}

/**
 * @typedef {Object} QueryResult
 * @property {number} score - (0, 1] of how well the given value matched the
 *                          search term
 * @property {T} value - The matched value (array of matches).
 */
