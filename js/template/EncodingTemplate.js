import Template, { TemplateType } from '~/template/Template';

import { fromEvent } from 'rxjs';

/**
 * A template representing an encoding.
 */
export default class EncodingTemplate extends Template {
    /**
     * Creates a EncodingTemplate given a encoding object.
     *
     * @param {Encoding} encoding - Encoding object
     */
    constructor(encoding) {
        super(
            <div class="lang-box">
                <div class="lang-box__info">
                    <span class="lang-box__name">{ encoding.displayName }</span>
                </div>
            </div>
        );
    }
}

export class EncodingFixedTemplate extends Template {
    /**
    * @param {Encoding} encoding - Encoding object
     */
    constructor(encoding) {
        let close = <a class="lang-box__close"><img src="/static/img/close.svg"/></a>;

        super(
            <div class="lang-box lang-box--fixed">
                <div class="lang-box__info">
                    <span class="lang-box__name">{ encoding.displayName }</span>
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
