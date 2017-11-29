import languages from '@/languages.json';
import ErrorManager from '~/helper/ErrorManager';

import Normalize from '~/models/Normalize';
import Query from '~/models/Query';

export const InvalidLanguage = Symbol('LanguageError.InvalidLanguage');

/**
 * Info about a programming language
 */
export default class Language {
    /**
     * Creates lanuage with a language id.
     * @param {string} id Language id from languages.json
     */
    constructor(id) {
        // Check if alias
        let alias = languages.alias[id];
        if (alias) return new Language(alias);

        /** @private */
        this.info = languages.languages[id];

        if (!this.info) {
            ErrorManager.raise(`no such language with id \`${id}\``, InvalidLanguage);
        }

        /** @private */
        this.id = id;
    }

    /**
     * User-friendly language name
     * @type {string}
     */
    get displayName() {
        return this.info.display || (this.info[0].toUpperCase() + this.info.substr(1));
    }

    /**
     * Returns language icon node.
     * @return {HTMLElement}
     */
    icon() {
        return <img src={ `/static/lang/${this.id}.svg` }/>;
    }

    /**
     * TIO language id. `null` if langauge does not support TIO.
     * @type {?string}
     */
    get tioId() {
        let tioid = languages.tio[this.id];
        if (tioid === 0) return null;
        return tioid || this.id;
    }

    /**
     * Checks if two languages are the same
     * @param  {Language} object other language object.
     * @return {boolean} representing if they are the same langauge or not.
     */
    equal(object) {
        return this.id === object.id;
    }

    /**
     * Query object for languages
     * @type {Query}
     */
    static get query() {
        if (this._query !== null) return this._query;

        let queryData = new Map()

        // Get query terms for a given language.
        let langIds = Object.keys(languages.languages);
        let i = keys.length;
        while (--i) {
            let id = langIds[i];
            let obj = new Language(id);
            list.set(id, obj);

            let displayTerms = new Normalize(obj.displayName).queryTerms();
            let termCount = displayTerms.length;
            while (--termCount) {
                list.set(displayTerms[termCount], obj);
            }
        }

        return this._query = new Query(queryData);
    }
    _query = null;
}
