import languages from '#/languages.json';
import ErrorManager from '~/helpers/ErrorManager';

import Normalize from '~/models/Normalize';
import Encoding from '~/models/Encoding';
import Query from '~/models/Query';

export const InvalidLanguage = Symbol('LanguageError.InvalidLanguage');

/**
 * Info about a programming language
 * @implements {JSONConvertable}
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
        return (this.info && this.info.display) || (this.id[0].toUpperCase() + this.id.substr(1));
    }

    /**
     * User-friendly and machine encoding
     * @return {Encoding}
     */
    async encoding() {
        return await Encoding.fromName(languages.encoding[this.id] || 'UTF-8');
    }

    /**
     * Returns language icon node.
     * @return {HTMLElement}
     */
    icon() {
        return <img src={ this.iconURL }/>;
    }

    /**
     * @type {string}
     */
    get iconURL() {
        return `/lang/logo/${this.id}.svg`
    }

    /**
     * @return {string}
     */
    toString() {
        return this.id;
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
     * Returns highlight-js id
     * @type {?string}
     */
    get hljsId() {
        let hljsId = languages.highlight[this.id];
        if (hljsId === 1) return this.id;
        return hljsId;
    }

    /**
     * CodeMirror-editor lang def file name.
     * @type {?string}
     */
    get cmName() {
        let cmName = languages.cm[this.id];
        if (!cmName) return null;
        if (cmName === 1) return this.id;
        if (cmName === 2) return `text/x-${this.id}`;
        return cmName;
    }

    /**
     * Byte-counts a JavaScript string (properly encoded)
     * @param {string} string
     */
    byteCount(string) {
        // let byteCount = 0;
        // for (const char of string) {
        //     const codePoint = char.codePointAt(0);

        // }
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
     * Unwraps from an API JSON object.
     * @param {Object} json JSON object.
     * @return {?Language} object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json) {
        try {
            return new Language(json);
        } catch(e) {
            return null;
        }
    }

    /**
     * Query object for languages
     * @type {Query}
     */
    static get query() {
        if (this._query !== null) return this._query;

        let query = new Query(
            Language.allLanguages,
            (lang) => lang.displayName
        );

        return query;
    }

    static _langCache = null;
    /**
     * Returns every language.
     * @return {Language[]}
     */
    static get allLanguages() {
        if (Language._langCache) return Language._langCache;

        let langs = [];
        let langIds = Object.keys(languages.languages);
        let i = langIds.length;
        while (--i >= 0) {
            langs.push(new Language(langIds[i]));
        }
        return langs;
    }

    static _query = null;
}
