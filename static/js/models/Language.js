import languages from '@/languages.json';
import ErrorManager from '~/helper/ErrorManager';

const InvalidLanguage = Symbol('LanguageError.InvalidLanguage');

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
}

export {InvalidLanguage};
