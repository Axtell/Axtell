import Template from '~/template/Template';

/**
 * Language picker template.
 * @implements {InputInterface}
 */
export default class LanguageInputTemplate extends Template {

    /** @override */
    get input() { this._backingInput = null; }

    /** @override */
    get userInput() { return this._userInput || null; }
}
