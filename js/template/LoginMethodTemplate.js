import Template from '~/template/Template';
import Theme from '~/models/Theme';
import Cross from '~/svg/Cross';

import { ButtonColor, ButtonStyle } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';

import { empty } from 'rxjs/index';
import { first, mapTo } from 'rxjs/operators';

/**
 * Template for a login method.
 */
export default class LoginMethodTemplate extends Template {

    /**
     * Create login template from infos _about_ template. Mind = blowk kaboom
     * @param {LoginMethod} loginMethod
     * @param {boolean} allowDelete - If allowed to delete
     */
    constructor(loginMethod, allowDelete) {
        const root = <div class="login-method"/>;
        super(root);

        const lastUsed = loginMethod.lastUsed ? moment(loginMethod.lastUsed).fromNow() : "never";
        const usedRecently = loginMethod.lastUsed && moment().diff(loginMethod.lastUsed, 'days') <= 7

        /** @type {LoginMethod} */
        this.loginMethod = loginMethod;

        /** @type {?RemoveButton}] */
        this.removeButton = null;

        let button = <DocumentFragment/>;
        if (allowDelete) {
            const removeButton = new ProgressButtonTemplate({
                text: 'remove',
                icon: Cross.cloneNode(true),
                color: ButtonColor.red,
                style: ButtonStyle.minimal
            });

            this.removeButton = removeButton;

            button = removeButton.unique();
        }

        root.appendChild(
            <DocumentFragment>
                <img class="login-method__column login-method__column--size-icon login-method__column--pad-around login-method__column--align-center" src={ Theme.current.staticImageForTheme(loginMethod.siteIcon) }/>
                <div class="login-method__column login-method__column--size-primary">
                    <span class="login-method__data login-method__data--style-primary">{ loginMethod.siteName }</span>
                    <span class="login-method__data login-method__data--style-value">{ loginMethod.identifier }</span>
                    <span class={`login-method__data login-method__data--style-detail ${usedRecently ? 'login-method__data--style-detail-highlight' : ""}`}>Last used { lastUsed }</span>
                </div>
                <div class="login-method__column login-method__column--align-center">
                    { button }
                </div>
            </DocumentFragment>
        );
    }

    /**
     * Called when removing. Emits the login method ID.
     * @return {Observable<Object>} emits object `{ method: ..., button: ... }`
     */
    observeRemove() {
        if (this.removeButton) {
            return this.removeButton
                .observeClick()
                .pipe(
                    first(),
                    mapTo(this));
        } else {
            return empty();
        }
    }
}
