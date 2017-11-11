import Auth, { AuthJWTToken } from '~/models/Auth';

import Template from '~/template/Template';
import ModalTemplate from '~/template/ModalTemplate';
import '~/promised/gapi';

const googleTrigger = document.getElementById("am-pgoogle");

/**
 * Authorization Modal dialog. This uses `#ammd-auth` as the modal template.
 *
 * @extends {ModalTemplate}
 */
export default class AuthModalTemplate extends ModalTemplate {
    /** @override */
    constructor() {
        super(
            "Login or Signup",
            Template.fromId("ammd-auth")
        );
    }
    
    /** @override */
    async didLoad() {
        // Setup Google Auth2 using Google API
        await gapi.loadAsync('auth2');
        
        gapi.auth2.init({
            client_id: window.config.pv_gid,
            cookiepolicy: 'single_host_origin',
            fetch_basic_profile: true
        }).attachClickHandler(googleTrigger, {}, (googleUser) => {
            // This attaches a 'click-handler' when google authorization is
            // finished, this is called
            // This is the authorization token we pass to server
            let { id_token } = googleUser.getAuthResponse();
            let profile = googleUser.getBasicProfile()
            
            this._login(id_token, {
                name: profile.getName(),
                email: profile.getEmail(),
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
            .catch(error => { throw error });
    }
}
