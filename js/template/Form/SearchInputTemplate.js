import Template from '~/template/Template';
import Language from '~/models/Language';
import SwappingTemplate from '~/template/SwappingTemplate';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import LanguageTemplate, { LanguageFixedTemplate } from '~/template/LanguageTemplate';

import { combineLatest, fromEvent, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, share, startWith } from 'rxjs/operators';

/**
 * @typedef {Object} SearchInputResults
 * @property {T[]} results - The results
 * @property {boolean} areMore - if more results
 */

/**
 * Abstract base for inputs which search
 * @implements {InputInterface}
 * @extends {Template}
 */
export default class SearchInputTemplate extends Template {
    /**
     * Creates an empty language input template with no language selected.
     * @param {Object} o - options
     * @param {Query} o.query - Object used for searching
     * @param {string} [o.placeholder=""] - placeholder for the input
     * @param {TextInputType} [o.inputType=Title] - Default input type
     */
    constructor({
        query,
        inputType = TextInputType.Title,
        placeholder = ''
    } = {}) {
        const root = <div class="search-picker__container" />;
        const rootSwapper = new SwappingTemplate(root);
        super(rootSwapper);

        /**
         * The input for the typical text input
         * @type {TextInputTemplate}
         */
        this.textInput = new TextInputTemplate(inputType, placeholder, {
            isOwned: false,
            isWide: true,
            autocomplete: false
        });

        /**
         * List of all results
         * @type {Element}
         */
        this.results = new SwappingTemplate(<div/>);

        /**
         * Emits the language when applicable
         * @type {BehaviorSubject}
         */
        this.value = new BehaviorSubject(null)
            .pipe(
                distinctUntilChanged(
                    (itemA, itemB) =>
                        itemA && itemB && this.compare(itemA, itemB)));

        root.appendChild(
            <DocumentFragment>
                { this.textInput.unique() }
                { this.results.unique() }
            </DocumentFragment>
        );

        combineLatest(
            this.textInput
                .observeValue(),
            this.textInput
                .observeFocus())
            .pipe(
                map(([queryString, isFocused]) => isFocused ? queryString : ""),
                distinctUntilChanged(),
                map((queryString) => query.findPage(queryString, {
                    maxResults: 3,
                    searchEmpty: false
                })))
            .subscribe(
                results => this.displayResults(results))

        this.value.subscribe(
            language => {
                if (language === null) {
                    rootSwapper.restoreOriginal();
                } else {
                    this.textInput.focus(false);

                    const template = this.fixedTemplateFor(language);
                    rootSwapper.displayAlternate(template);

                    this.observeCancelFor(template)
                        .pipe(
                            mapTo(null))
                        .subscribe(this.value);
                }
            })
    }

    /**
     * Display array of results
     * @param {?(T[])} resultObject - Iterable of results
     */
    displayResults(resultObject) {
        if (resultObject === null) {
            // This means we should hide results
            this.results.restoreOriginal();
            return;
        }

        const { areMore, results } = resultObject;

        // Otherwise show results
        if (results.length === 0) {
            this.results.displayAlternate(
                <div class="search-picker search-picker--empty">
                    No results
                </div>
            );
            return;
        } else {
            const list = <ul class="search-picker__list"/>;

            for (const result of results) {
                const listItem = <li class="search-picker__item" />;
                const template = this.resultTemplateFor(result);
                const node = template.loadInContext(listItem);
                list.appendChild(listItem);

                fromEvent(node, 'mousedown')
                    .pipe(
                        filter(event => event.which === 1),
                        mapTo(result))
                    .subscribe(this.value);
            }

            if (areMore) {
                list.appendChild(
                    <li class="search-picker__hidden">more results not shown</li>
                );
            }

            this.results.displayAlternate(
                <div class="search-picker">
                    { list }
                </div>
            );
        }
    }


    /**
     * Template for a given result
     * @param {T} result
     * @return {Template} template w/ lifecyle events
     * @abstract
     */
    resultTemplateFor(result) { return null; }

    /**
     * Fixed template to embed in
     * @param {T} result
     * @return {Template} template w/ cancelable observable
     * @abstract
     */
    fixedTemplateFor(result) { return null; }

    /**
     * Observable for fixed template
     * @param {Template} template - The template from which to return 'cancel'
     * @return {Observable} can emit any value doesn't matter
     * @abstract
     */
    observeCancelFor(template) { return null; }

    /**
     * Override to specify comparator
     * @param {T} a - First object of type of search type
     * @param {T} b - Second object
     * @return {boolean} if equal
     * @abstract
     */
    compare(a, b) { return a === b; }

    // MARK: - InputInterface
    /** @override */
    observeValue() {
        return this.value;
    }

    /** @override */
    get userInput() { return this.textInput || null; }
}
