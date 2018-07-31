import Request from '~/models/Request/Request';

/**
 * Runs request using Axtell REST paging.
 * @extends {Request}
 */
export default class PagedRequest extends Request {
    /**
     * The async iterator loads individual items. DO NOT
     * call any other methods as that will mess up the
     * page indexing.
     */
    async *[Symbol.iterator]() {
        let data,
            page = 1,
            areMore = false;

        do {
            ({ data, areMore } = await this.getPage(page, false));
            yield* data;
            page += 1;
        } while(areMore);
    }

    /**
     * Runs for the next page (starts at zero).
     * @return {?Object} Same type as the {@link Request#format}.
     */
    async nextPage() {
        this._path = `${this._sourcePath}/page/${this._page}`;

        const result = await this.run(false);
        this._page += 1;
        this._areMore = result.are_more;

        return result.data.map(item => this.format(item));
    }

    /**
     * Gets a specific page.
     * @param {number} page - The page to load
     * @param {boolean} [mutate=true] - Set to false to not
     *                                mutate.
     * @return {Object}
     * @property {Object[]} data - Array of data
     * @property {boolean} areMore - If there is more. If mutate
     *                             is true, this is the same as
     *                             doing
     *                             {@link PagedRequest#areMore}
     */
    async getPage(page, mutate = true) {
        const originalPage = this._page;
        const originalAreMore = this._areMore;
        this._page = page;
        const result = await this.nextPage();
        let areMore = this.areMore;

        if (mutate === false) {
            this._areMore = originalAreMore;
            this._page = originalPage;
        }

        return {
            data: result,
            areMore: areMore
        };
    }

    /**
     * If they are definetly more. If you haven't run a request
     * this is false because we have no idea how many there are
     * at the time.
     * @type {boolean}
     */
    get areMore() { return this._areMore || false; }

    /**
     * Gets the current page.
     * @type {number}
     */
    get page() { return this._page; }

    /**
     * Sets the current page. Do note this will remove all context
     * but will not break iterators.
     * @type {number}
     */
    set page(newPage) { this._page = newPage; }

    /**
     * @override
     * @param {Object} options - See {@link Request#constructor}
     */
    constructor(options) {
        super(options);
        this._sourcePath = this._path;
        this._page = 1;
        this._areMore = null;
    }
}
