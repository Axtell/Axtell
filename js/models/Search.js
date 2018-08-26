import Data, { EnvKey } from '~/models/Data';
import ErrorManager from '~/helpers/ErrorManager';
import algoliasearch from 'algoliasearch/lite';

import Answer from '~/models/Answer';
import Post from '~/models/Post';
import User from '~/models/User';

export class SearchCategory {
    /**
     * @param {Object} opts
     * @param {string} opts.name - Backend facing name
     * @param {string} opts.title - Title friendly to user
     * @param {Function} opts.formatter - Takes object as arg and spits out
     *                                  full object
     */
    constructor({ name, title, formatter } = {}) {
        /** @private */
        this.name = name;

        /** @type {string} */
        this.title = title;

        /** @type {Function} */
        this.format = formatter;
    }
}

export const SearchCategories = [
    new SearchCategory({
        name: 'posts',
        title: 'Challenges',
        formatter: Post.fromIndexJSON
    }),
    new SearchCategory({
        name: 'answers',
        title: 'Answers',
        formatter: Answer.fromIndexJSON
    }),
    new SearchCategory({
        name: 'users',
        title: 'Users',
        formatter: User.fromIndexJSON
    })
];

export default class Search {

    /**
     * Creates a standard instance
     * @return {Search}
     */
    static createClient() {
        return new Search(
            Data.shared.envValueForKey(EnvKey.algoliaAppId),
            Data.shared.envValueForKey(EnvKey.algoliaSearchKey),
            Data.shared.envValueForKey(EnvKey.indexPrefix)
        );
    }

    /**
     * Obtains an index name
     * @param {string} name - Input name
     * @return {string}
     */
    getIndexName(name) {
        if (this.prefix) {
            return `${this.prefix}_${name}`;
        } else {
            return name;
        }
    }

    /**
     * Obtains an index
     * @param {name} string
     * @return {algoliasearch.Index}
     */
    getIndex(name) {
        return this.client.initIndex(this.getIndexName(name));
    }

    /**
     * Obtains index from category
     * @param {Category} [varname] [description]
     */
    getIndexFromCategory(category) {
        return this.getIndex(category.name);
    }

    /**
     * Obtains search category with name
     */
    getCategoryFromFullName(name) {
        return this.indexMap.get(name.replace(/^.+?_/, ''));
    }

    /**
     * Creates site search instance
     * @param {string} appId       generally from the data ids
     * @param {string} searchToken generally from the data ids
     * @param {string} prefix      generally from the data ids
     * @param {SearchCategory[]} [categories=[]] Additional search categories
     */
    constructor(appId, searchToken, prefix, categories = []) {
        /** @type {string} */
        this.prefix = prefix;

        /** @type {algoliasearch.Client} */
        this.client = algoliasearch(appId, searchToken);

        /** @type {SearchCategory[]} */
        this.allCategories = SearchCategories.concat(categories);

        /** @type {Map} */
        this.indexMap = new Map(this.allCategories.map(category => [category.name, category]));

        /** @type {algoliasearch.Index[]} */
        this.indices = this.allCategories.map(category => this.getIndexFromCategory(category));
    }

    /**
     * Performs a search across indexes.
     * @param {string} query - The text for search
     * @param {Object} opts - See {@link MultiIndexSearch}
     * @return {GlobalSearch} Use this to iterate through pages.
     */
    globalSearch(query, opts) {
        return new MultiIndexSearch(
            this,
            query,
            this.allCategories.map(
                category => this.getIndexName(category.name)),
            opts
        );
    }

    /**
     * Formats a result
     * @param {Object} result
     */
    formatResult(category, result) {
        let formatted;
        try {
            formatted = category.format(result);
        } catch(error) {
            ErrorManager.silent(error, `Failed to format object of type ${category.name}`, result);
            return null;
        }
        return new SearchResult(category, formatted, result);
    }

}

/**
 * A group of categories. This supports formatting for most types
 */
export class MultiIndexSearch {
    /**
     * @param {Search} search - The search object
     * @param {string} query - Query
     * @param {string[]} indices - Names of indices to iterate over
     * @param {Object} opts - The options
     * @param {number} [perPage=20] - Amount to load per page
     */
    constructor(search, query, indices, { perPage = 20 } = {}) {
        this.search = search;
        this.opts = indices.map(indexName => ({
            indexName: indexName,
            query: query,
            params: {
                hitsPerPage: perPage,
                advancedSyntax: true
            }
        }));

        this._areMore = true;
        this._pages = [];
        this._pageNo = 0;
    }

    /**
     * Formats a batch result
     * @param {Object} response
     */
    formatResults(response) {
        const results = response.results;
        const resultMap = new Map();

        let areMore = false;
        for (let i = 0; i < results.length; i++) {
            const indexName = results[i].index;
            const category = this.search.getCategoryFromFullName(indexName);
            let categoryHasMore = false;

            if (results[i].page < results[i].nbPages - 1) {
                areMore = true;
                categoryHasMore = true;
            }

            let formattedResults = [];

            for (let j = 0; j < results[i].hits.length; j++) {
                const formattedResult = this.search.formatResult(category, results[i].hits[j]);
                if (formattedResult !== null) {
                    formattedResults.push(formattedResult);
                }
            }

            resultMap.set(category, { areMore: categoryHasMore, results: formattedResults });
        }

        return new SearchResults(this.search, resultMap, areMore);
    }

    /**
     * Gets the nth page
     * @param {number} pageNumber
     * @return {SearchResults}
     */
    async getPage(pageNumber) {
        if (this._pages[pageNumber])
            return this._pages[pageNumber];

        const results = await this.search.client.search(this.opts);
        return this.formatResults(results);
    }

    /**
     * Obtains the next page
     * @return {?SearchResults}
     */
    async next() {
        if (!this._areMore) return null;

        const result = await this.getPage(this._pageNo++);
        if (!result.areMore) {
            this._areMore = false;
        }
        return result;
    }

    /**
     * If they are more.
     * @type {boolean}
     */
    get areMore() { return this._areMore; }

    /**
     * Will start at the page as incremented by `next()`.
     * @return {SearchResults}
     */
    async *[Symbol.iterator]() {
        while (this.areMore) {
            yield* await this.next();
        }
    }
}

/**
 * Represents categories or list of results.
 */
export class SearchResults {
    /**
     * Represents group of search results
     * @param {Search} search
     * @param {Map} results From {@link MultiIndexSearch}
     * @param {boolean} areMore
     */
    constructor(search, results, areMore) {
        /** @type {Search} */
        this.search = search;

        /** @private */
        this.results = results;

        /**
         * @readonly
         * @type {boolean}
         */
        this.areMore = areMore;
    }

    /**
     * Checks if category has more
     * @param {SearchCategory} category
     * @return {boolean} If more results exist
     */
    areMoreResultsForCategory(category) {
        return this.results.get(category).areMore;
    }

    /**
     * Returns results for a category
     * @param {SearchCategory} category
     * @return {SearchResult[]}
     */
    getResultsForCategory(category) {
        return this.results.get(category).results;
    }

    /**
     * Checks if category is empty
     * @param {SearchCategory} category
     * @return {boolean}
     */
    categoryHasResultsForCategory(category) {
        return this.getResultsForCategory(category).length > 0;
    }

    /**
     * Iterates by category.
     * @return {SearchCategory}
     */
    *categories() {
        yield* this.results.keys();
    }

    /**
     * Iterates category/result pairs
     * @return {[SearchCategory, SearchResult[]]}
     */
    *resultsByCategory() {
        for (const [category, { results }] of this.results) {
            yield [category, results];
        }
    }

    /**
     * Iterates by item
     */
    *results() {
        for (const [category, { results }] of this.results) {
            yield* results;
        }
    }
}

/**
 * Represents a given search result as native object
 */
export class SearchResult {
    /**
     * Represents search result
     * @param {SearchCategory} category - A search category
     * @param {Object} object
     * @param {Object} result - the result object from algolia
     */
    constructor(category, object, result) {
        /** @type {SearchCategory}] */
        this.category = category;

        /** @private */
        this.object = object;

        /** @private */
        this._result = result;

        /** @type {number} */
        this.id = result.objectID;

    }

    /**
     * Obtains highlight snippet for key
     * @param {string} key - Key of item eg `author.name`
     * @param {?Function} predicate - If key exists call the predicate and return
     *                              the results, else fragment.
     * @param {string} [type=span] - Node type to wrap in
     * @return {DocumentFragment} HTML node with <em> for highlights
     * @throws {TypeError} If key not found
     */
    highlightSnippetForKey(key, predicate = null, type = 'span') {
        const parts = key.split('.');
        let lastSnippet = this._result._snippetResult;

        for (let i = 0; i < parts.length; i++) {
            lastSnippet = lastSnippet[parts[i]];

            if (!lastSnippet) {
                throw new TypeError(`section ${parts[i]} of ${key} not found in object type ${this.category.name}.`);
            }
        }

        const value = lastSnippet.value;
        const tempWrapper = document.createElement(type);
        tempWrapper.innerHTML = value;

        if (predicate) {
            if (lastSnippet.matchLevel !== 'none') {
                return predicate(tempWrapper);
            } else {
                return document.createDocumentFragment();
            }
        } else {
            return tempWrapper;
        }
    }

    /**
     * Obtains the _full_ highlight
     * @param {string} key - Key of item eg `author.name`
     * @return {string} string of the value.
     * @throws {TypeError} If key not found
     */
    highlightForKey(key) {
        const parts = key.split('.');
        let lastHighlight = this._result._highlightResult;

        for (let i = 0; i < parts.length; i++) {
            lastHighlight = lastHighlight[parts[i]];

            if (!lastHighlight) {
                throw new TypeError(`section ${parts[i]} of ${key} not found in object type ${this.category.name}.`);
            }
        }

        return lastHighlight.value;
    }

    /**
     * Returns value
     */
    get value() { return this.object; }
}
