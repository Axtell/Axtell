import Encoding from '~/models/Encoding';
import SearchInputTemplate from '~/template/Form/SearchInputTemplate';
import EncodingTemplate, { EncodingFixedTemplate } from '~/template/EncodingTemplate';

/**
 * Encoding picker template.
 * @extends {SearchInputTemplate}
 */
export default class EncodingInputTemplate extends SearchInputTemplate {
    /**
     * Pass the query from {@link Encoding.query} which is async.
     * @param {Query<Encoding>} query
     */
    constructor(query) {
        super({
            query: query,
            placeholder: 'Encoding'
        });
    }

    // MARK: - SearchInputTemplate
    /** @override */
    resultTemplateFor(result) {
        return new EncodingTemplate(result);
    }

    /** @override */
    fixedTemplateFor(result) {
        return new EncodingFixedTemplate(result);
    }

    /** @override */
    observeCancelFor(template) {
        return template.observeCancel();
    }

    /** @override */
    compare(a, b) {
        return a.name === b.name;
    }
}
