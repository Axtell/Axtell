import Template, { TemplateType } from '~/template/Template';

/**
 * A template representing a language.
 */
export default class LanguageTemplate extends Template {
    /**
     * Creates a LanuageTemplate given a language object.
     *
     * @param {Language} language - Language object
     */
    constructor(language) {
        super(
            <div className="lang-box">
                { language.icon() }
                <div>
                    <span className="lang-name">{ language.displayName }</span>
                    <span className="lang-desc">{ language.displayName } does { language.tioId ? "not ": "" }support TIO.</span>
                </div>
            </div>
        );
    }
}
