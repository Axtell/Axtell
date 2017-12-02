import Template, { TemplateType } from '~/template/Template';
import LanguageTemplate from '~/template/LanguageTemplate';

/**
 * A template representing a list of {@link LanguageTemplate} objects.
 */
export default class LanguageListTemplate extends Template {
    /**
     * Creates a LanuageListTemplate stub. Use state transitions to set values.
     */
    constructor() {
        let root = <ul class="lang-list"></ul>;
        super(root);

        this._list = root;
        this._langs = [];
    }

    /**
     * Appends a language to the list.
     * @param {Language} language Lang
     */
    appendLanguage(language) {
        let lang = new LanguageTemplate(language).loadInContext(this._list);
        this._langs.push(lang);
        return lang;
    }

    /**
     * Removes all the languages from the list.
     */
    clearList() {
        while (this._langs.length > 0) {
            let lang = this._langs.pop();
            lang.parentNode.removeChild(lang);
        }
    }
}
