import Auth, {AuthJWTToken} from '~/models/Auth';
import Data from '~/models/Data';

import Template, {TemplateType} from '~/template/Template';
import ModalViewTemplate from '~/template/ModalViewTemplate';
import LoginMethodSelectorTemplate from '~/template/login/LoginMethodSelectorTemplate';
import '~/modern/gapi';

import ErrorManager from '~/helpers/ErrorManager';

import { merge } from 'rxjs/index';
import { tap, exhaustMap, share } from 'rxjs/operators';

/**
 * Authorization Modal dialog. This uses `#ammd-auth` as the modal template.
 */
export default class AuthModalTemplate extends ModalViewTemplate {
    /**
     * @param {?string} subtitle - Some description explaining why opened
     * @param {Object} [options={}] custom oauth opts for {@link Auth.oauthEndpointForSite}
     */
    constructor(subtitle = null, options = {}) {
        const google = new LoginMethodSelectorTemplate({
            siteClass: 'google',
            siteImage: 'google',
            siteName: 'Google'
        });

        const stackexchange = new LoginMethodSelectorTemplate({
            siteClass: 'stackexchange',
            siteImage: 'stackexchange',
            siteName: 'Stack Exchange'
        });

        const github = new LoginMethodSelectorTemplate({
            siteClass: 'github',
            siteImage: 'github',
            siteName: 'GitHub'
        });

        super(
            <div id="ammd-auth">
                <div id="providers">
                    { google.unique() }
                    { stackexchange.unique() }
                    { github.unique() }
                </div>
            </div>,
            {
                title: 'Login or Signup.',
                subtite: 'Access Axtell using any of the following providers.'
            }
        );

        const auth = Auth.shared;

        /**
         * Authorization config
         */
        this.config = options.authConfig || {};

        /**
         * Provider object
         * @type {Object}
         */
        this.providers = {
            stackexchange,
            github,
            google
        };

        /** @private */
        this.observeLogin = merge(
            this.providers.stackexchange
                .observeClick()
                .pipe(
                    exhaustMap(
                        () => auth.authorizeOAuth('stackexchange.com', options))),
            this.providers.github
                .observeClick()
                .pipe(
                    exhaustMap(
                        () => auth.authorizeOAuth('stackexchange.com', options))),
            this.providers.google
                .observeClick()
                .pipe(
                    exhaustMap(
                        () => auth.authorizeOAuth('google.com', options))))
            .pipe(
                share());

        /** @private */
        this.options = options;

        this.subtitle = subtitle;
    }

    /** @override */
    async didInitialLoad() {
        await super.didInitialLoad();

        this.observeLogin.subscribe(() => {
            window.location.reload();
        });
    }

    /**
     * Called when complete. MUST have appropriate params. Do note that if client
     * flow is NOT enabled then the page will refresh automatically unless auth
     * is complete.
     * @return {Observable<Object>}
     */
    observeLogin() {
        return this.observeLogin;
    }

}
