import Auth, {AuthJWTToken} from '~/models/Auth';
import Data from '~/models/Data';

import Template, {TemplateType} from '~/template/Template';
import ModalViewTemplate from '~/template/ModalViewTemplate';
import '~/modern/gapi';

import ErrorManager from '~/helpers/ErrorManager';

const googleTrigger = document.getElementById("am-pgoogle");

/**
 * Authorization Modal dialog. This uses `#ammd-auth` as the modal template.
 */
export default class AuthModalTemplate extends ModalViewTemplate {
    /**
     * @param {?string} subtitle - Some description explaining why opened
     */
    constructor(subtitle = null) {
        super(
            Template.fromId("ammd-auth", TemplateType.move),
            {
                title: 'Login or Signup.',
                subtite: 'Access Axtell using any of the following providers.'
            }
        );

        this.subtitle = subtitle;
    }

    /** @override */
    async didLoad() {
        // Setup Google Auth2 using Google API
        await gapi.loadAsync('auth2');

        gapi.auth2.init({
            client_id: Data.shared.envValueForKey('GAPI_KEY'),
            cookiepolicy: 'single_host_origin',
            fetch_basic_profile: true
        }).attachClickHandler(googleTrigger, {}, (googleUser) => {
            // This attaches a 'click-handler' when google authorization is
            // finished, this is called
            // This is the authorization token we pass to server
            let {id_token} = googleUser.getAuthResponse();
            let profile = googleUser.getBasicProfile();

            this._login(id_token, {
                name: profile.getName(),
                email: profile.getEmail(),
                identifier: profile.getEmail(),
                avatar: profile.getImageUrl()
            });
        });
    }

    /**
     * Logs in using a provider.
     * @param {string} authToken OpenID auth token.
     * @param {AuthProfile} profile Authorization profile
     */
    _login(authToken, profile) {
        Auth.shared
            .then(async auth => {
                let token = new AuthJWTToken(authToken, profile);
                await auth.loginJWT(token);

                // When finished just reload page
                // Page will obviously change which is why why must reload
                window.location.reload(true);
            })
            .catch(error => {
                if (!error.response) {
                    ErrorManager.silent(
                        error,
                        `Failed to connect to local authorization server.`
                    );
                    return;
                }

                switch (error.response.status) {
                    case 403:
                        ErrorManager.silent(
                            error,
                            `Key authentication failed. Either expired on ` +
                            `client/server or hijacked token.`
                        );
                        break;

                    case 400:
                        ErrorManager.silent(
                            error,
                            `Malformed client login token recieved. Missing ` +
                            `subject or issuer parameters.`
                        );
                        break;

                    default:
                        ErrorManager.silent(
                            error,
                            `Unexpected login error`,
                            error.response.data
                    );
                }
            });
    }
}
