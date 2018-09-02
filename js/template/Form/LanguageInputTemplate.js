import Template from '~/template/Template';
import Language from '~/models/Language';
import SwappingTemplate from '~/template/SwappingTemplate';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import LanguageTemplate, { LanguageFixedTemplate } from '~/template/LanguageTemplate';

import { combineLatest, fromEvent, BehaviorSubject } from 'rxjs';
import { map, mapTo, filter, share, distinctUntilChanged } from 'rxjs/operators';

/**
 * Language picker template.
 * @implements {InputInterface}
 */
export default class LanguageInputTemplate extends Template {
    /**
     * Creates an empty language input template with no language selected.
     */
    constructor() {
        const root = <div class="language-picker__container" />;
        const rootSwapper = new SwappingTemplate(root);
        super(rootSwapper);

        /**
         * The input for the typical text input
         * @type {TextInputTemplate}
         */
        this.textInput = new TextInputTemplate(TextInputType.Title, 'Language Name', {
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
        this.language = new BehaviorSubject(null)
            .pipe(
                distinctUntilChanged(
                    (oldLanguage, newLanguage) =>
                        oldLanguage && newLanguage && oldLanguage.equal(newLanguage)),
                share());

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
                map(([query, isFocused]) => isFocused ? query : ""),
                distinctUntilChanged(),
                map((query) => Language.query.findPage(query, {
                    maxResults: 3,
                    searchEmpty: false
                })))
            .subscribe(
                results => this.displayLanguages(results))

        this.language.subscribe(
            language => {
                if (language === null) {
                    rootSwapper.restoreOriginal();
                } else {
                    this.textInput.focus(false);

                    const languageFixedTemplate = new LanguageFixedTemplate(language);
                    rootSwapper.displayAlternate(languageFixedTemplate);

                    languageFixedTemplate
                        .observeCancel()
                        .pipe(
                            mapTo(null))
                        .subscribe(this.language);
                }
            })
    }

    /**
     * Display array of languages
     * @param {?(Language[])} languages - Iterable of languages
     */
    displayLanguages(languages) {
        if (languages === null) {
            this.results.restoreOriginal();
            return;
        }

        // Otherwise show results
        if (languages.results.length === 0) {
            this.results.displayAlternate(
                <div class="language-picker language-picker--empty">
                    <h3>No results</h3>
                </div>
            );
            return;
        } else {
            const list = <ul class="language-picker__list"/>;

            for (const language of languages.results) {
                const listItem = <li class="language-picker__language" />;
                const languageTemplate = new LanguageTemplate(language);
                const languageNode = languageTemplate.loadInContext(listItem);
                list.appendChild(listItem);

                fromEvent(languageNode, 'mousedown')
                    .pipe(
                        filter(event => event.which === 1),
                        mapTo(language))
                    .subscribe(this.language);
            }

            this.results.displayAlternate(
                <div class="language-picker">
                    { list }
                </div>
            );
        }
    }

    // MARK: - InputInterface
    /** @override */
    observeValue() {
        return this.language;
    }

    /** @override */
    get userInput() { return this.textInput || null; }
}
