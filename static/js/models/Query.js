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
    constructor(map, comp) {
        this._map = map;
        this._comp = comp;
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
     * @param {boolean} sort - if to sort results by score.
     * @return {QueryResult[]} the candidate objects.
     */
    find(term, limit = Infinity, threshold = 0.8, sort = true) {
        // format { score: number, value: T }
        let candidates = [];
        let termLength = term.length;

        if (term.length === 0) return [];

        querySearch:
        for (let [termName, values] of this._map) {
            let matchedIndices = [];

            let termSearchLength = term.length;

            match:
            while (--termSearchLength) {
                let index = -1,
                    letter = term[termSearchLength];

                do {
                    index = termName.indexOf(letter, index + 1);
                    if (index === -1) continue match;
                } while(matchedIndices.includes(index));
                matchedIndices.push(index);
            }

            let score = matchedIndices.length / termLength;
            if (score > threshold) {
                // Check if already exists
                let candidateIndex = candidates.length;
                while (--candidateIndex >= 0) {
                    if (this._comp(candidates[candidateIndex].value, values)) {
                        continue querySearch;
                    }
                }

                candidates.push({
                    score: score,
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
        let terms = new Normalize(string).queryTerms(),
            termIndex = terms.length;

        if (terms.length === 0) return [];

        let matches = this.find(terms[--termIndex], Infinity, threshold, false);

        while (--termIndex >= 0) {
            let results = this.find(terms[termIndex], Infinity, threshold, false),
                resultCount = results.length;

            addResult:
            while (--resultCount >= 0) {
                let result = results[resultCount];
                let matchLength = matches.length;

                while (--matchLength >= 0) {
                    if (this._comp(matches[matchLength].value, result.value)) continue addResult;
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
