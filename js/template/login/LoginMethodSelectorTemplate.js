import Template from '~/template/Template';
import Theme from '~/models/Theme';

import { fromEvent } from 'rxjs/index';
import { tap, shareReplay } from 'rxjs/operators';

/**
 * Login method template for like selecting one
 * @abstract
 */
export default class LoginMethodSelectorTemplate extends Template {

    /**
     * @param {Object} opts
     * @param {string} obj.siteClass - Class of the site
     * @param {string} obj.siteImage - rel image of site
     * @param {string} obj.siteName - Name of site
     */
    constructor({ siteClass, siteImage, siteName }) {
        const root = (
            <div class={`am-provider am-provider--site-${siteClass}`} rel="nofollow">
                <img src={ Theme.dark.imageForTheme(siteImage) }/>
                <span>{ `${siteName} Login` }</span>
            </div>
        );

        super(root);

        this._observeClick = fromEvent(this.underlyingNode, 'click');
    }

    /**
     * Returns observer for click event
     */
    observeClick() {
        return this._observeClick;
    }

}
