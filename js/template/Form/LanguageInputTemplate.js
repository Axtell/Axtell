import Language from '~/models/Language';
import SearchInputTemplate from '~/template/Form/SearchInputTemplate';
import LanguageTemplate, { LanguageFixedTemplate } from '~/template/LanguageTemplate';

/**
 * Language picker template.
 * @extends {SearchInputTemplate}
 */
export default class LanguageInputTemplate extends SearchInputTemplate {
    constructor() {
        super({
            query: Language.query,
            placeholder: 'Language Name'
        })
    }

    // MARK: - SearchInputTemplate
    /** @override */
    resultTemplateFor(result) {
        return new LanguageTemplate(result);
    }

    /** @override */
    fixedTemplateFor(result) {
        return new LanguageFixedTemplate(result);
    }

    /** @override */
    observeCancelFor(template) {
        return template.observeCancel();
    }

    /** @override */
    compare(a, b) {
        return a.equal(b);
    }
}
