import SearchCategoryTemplate from '~/template/Search/SearchCategoryTemplate';
import Template from '~/template/Template';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import SwappingTemplate from '~/template/SwappingTemplate';
import LoadingIcon from '~/svg/LoadingIcon';
import Search from '~/models/Search';
import KeyManager from '~/models/KeyManager';
import Theme from '~/models/Theme';

import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

import { merge } from 'rxjs';
import { scan, filter, switchMap, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';

export default class SearchTemplate extends Template {

    /**
     * Creates base search template
     * @async
     */
    constructor() {
        const root = <div class="search-overlay__positioner"/>;
        super(root);

        /** @type {SwappingTemplate} */
        this.searchIconTemplate = new SwappingTemplate(
            <img src={Theme.current.imageForTheme('search')} />
        );

        /** @type {SVGSVGElement} */
        this.loadingIcon = LoadingIcon.cloneNode(true);

        /** @type {TextInputTemplate} */
        this.searchText = new TextInputTemplate(TextInputType.Search, 'Find a challenge, user, answer, ...', {
            autofocus: true,
            isOwned: true
        });

        /** @type {SwappingTemplate} */
        this.resultContainer = new SwappingTemplate();

        /** @type {Search} */
        this.searchClient = Search.createClient();

        /** @type {?KeyManager} */
        this.keyManager = null;

        // Keeps track of focus using keyboard
        /** @private */
        this.resultFocus = null;

        return (async () => {
            root.appendChild(
                <DocumentFragment>
                    <div class="search-overlay-base">
                        <div class="search-overlay">
                            <div class="search-overlay__component search-overlay__component--type-image">
                                { this.searchIconTemplate.unique() }
                            </div>
                            <div class="search-overlay__component search-overlay__component--size-stretch search-overlay__component--type-input">
                                { this.searchText.unique() }
                            </div>
                        </div>
                        <div class="search-overlay__credit">
                            <a href="https://www.algolia.com" title="Search by Algolia">
                                <img src={Theme.current.imageForTheme('algolia/by-algolia')} alt="Search by Algolia"/>
                            </a>
                        </div>
                    </div>
                    { this.resultContainer.unique() }
                </DocumentFragment>
            );

            // This observer is called when new result is loaded
            this.loadedResults = this.searchText
                .observeInput
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(200),
                    map(event => event.target.value),
                    switchMap(async value => await this.search(value)));


            this.loadedResults.subscribe(results =>
                this.displayResults(results)
                    .catch(HandleUnhandledPromise));

            return this;
        })();
    }

    /** @override */
    didLoad() {
        super.didLoad();
        this.searchText.focus();

        this.keyManager = new KeyManager(document);
        this.keyManager.addTarget(this.searchText.underlyingNode);

        this.resultFocus = merge(
            this.loadedResults
                .pipe(map(() => ({ reset: true }))),
            this.keyManager.registerObservable('ArrowDown')
                .pipe(map(() => ({ change: 1 }))),
            this.keyManager.registerObservable('ArrowUp')
                .pipe(map(() => ({ change: -1 }))))
            .pipe(
                scan((oldIndex, { reset, change }) => reset ? -1 : Math.max(oldIndex + change, -1), -1))
            .subscribe(::this.setResultFocus);
    }

    /**
     * Sets focus to the nth item
     * @param {number} index - Noop if out of range
     */
    setResultFocus(index) {
        if (index === -1) {
            this.searchText.focus();
        } else {
            const result = this.results[index % this.results.length];

            if (!result)
                return;

            result.focus();
        }
    }

    /** @override */
    didUnload() {
        super.didUnload();
        this.keyManager.clear();
        this.resultFocus.unsubscribe();
    }

    /**
     * Searches for a query
     * @param {string} query
     */
    async search(query) {
        this.searchIconTemplate.displayAlternate(this.loadingIcon);

        const searchResults = await this.searchClient.globalSearch(query, { perPage: 3 }).next();

        this.searchIconTemplate.restoreOriginal();

        return searchResults;
    }

    /**
     * Displays search results
     * @param {SearchResults} results
     */
    async displayResults(results) {
        const parent = <div class="search-list"/>,
            templates = [];

        let isAtLeastOneResult = false;

        for (const [category, items] of results.categories()) {
            if (items.length === 0) continue;
            isAtLeastOneResult = true;

            const template = new SearchCategoryTemplate(category, items);
            templates.push(...template.results);
            template.loadInContext(parent);
        }

        this.results = templates;
        this.resultIndex = -1;

        if (!isAtLeastOneResult) {
            parent.appendChild(
                <div class="search-overlay-base search-result__empty">
                    No results found
                </div>
            );
        }

        this.resultContainer.displayAlternate(parent);
    }
}
