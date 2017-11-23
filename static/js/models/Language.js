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
        let alias = languages.alias[id]
        if (alias) return new Language(alias);
        
        this.info = languages.languages[id];
        
        if (!this.info) {
            ErrorManager.raise(`no such language with id \`${id}\``, InvalidLanguage);
        }
        
        this.id = id;
    }
    
    /**
     * @type {?string} TIO language id. `null` if langauge does not support TIO.
     */
    get tioId() {
        let tioid = languages.tio[this.id];
        if (tioid === 0) return null;
        return tioid || this.id;
    }
}

export { InvalidLanguage };
