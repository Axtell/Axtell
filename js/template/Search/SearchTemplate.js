import SearchCategoryTemplate from '~/template/Search/SearchCategoryTemplate';
import Template from '~/template/Template';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import SwappingTemplate from '~/template/SwappingTemplate';
import LoadingIcon from '~/svg/LoadingIcon';
import Search from '~/models/Search';
import Theme from '~/models/Theme';

import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

import { tap, switchMap, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';

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

        /** @private */
        this.pendingRequest = null;

        return (async () => {
            root.appendChild(
                <DocumentFragment>
                    <div class="search-overlay">
                        <div class="search-overlay__component search-overlay__component--type-image">
                            { this.searchIconTemplate.unique() }
                        </div>
                        <div class="search-overlay__component search-overlay__component--size-stretch search-overlay__component--type-input">
                            { this.searchText.unique() }
                        </div>
                    </div>
                    { this.resultContainer.unique() }
                </DocumentFragment>
            );

            // Setup search
            this.searchText
                .observe()
                .pipe(
                    distinctUntilChanged(),
                    debounceTime(200),
                    map(event => event.target.value),
                    switchMap(async value => await this.search(value)))
                .subscribe(results =>
                    this.displayResults(results)
                        .catch(HandleUnhandledPromise));

            return this;
        })();
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
        const parent = <div class="search-list"/>;
        for (const [category, items] of results.categories()) {
            new SearchCategoryTemplate(category, items).loadInContext(parent);
        }
        this.resultContainer.displayAlternate(parent);
    }
}
