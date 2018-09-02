import Template, { TemplateType } from '~/template/Template';

import { fromEvent } from 'rxjs';

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
            <div class="lang-box">
                <div class="lang-box__logo">{ language.icon() }</div>
                <div class="lang-box__info">
                    <span class="lang-box__name">{ language.displayName }</span>
                </div>
            </div>
        );
    }
}

export class LanguageFixedTemplate extends Template {
    /**
    * @param {Language} language - Language object
     */
    constructor(language) {
        let close = <div class="lang-box__close"><img src="/static/img/close.svg"/></div>;

        super(
            <div class="lang-box lang-box--fixed">
                <div class="lang-box__logo">{ language.icon() }</div>
                <div class="lang-box__info">
                    <span class="lang-box__name">{ language.displayName }</span>
                </div>
                { close }
            </div>
        );

        this._cancel = fromEvent(close, 'click');
    }

    /**
     * Observable emitted when 'close' is triggered.
     * @return {Observable}
     */
    observeCancel() {
        return this._cancel;
    }
}
