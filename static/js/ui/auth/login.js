import Auth, { AuthData } from '~/interactor/Auth';
import { ModalContext, Modal, ModalType } from '~/controllers/Modal';

/**
 * Authorization Modal dialog. This uses `#ammd-auth` as the modal template.
 */
class AuthModal extends Modal {
    constructor() {
        super(
            "Login or Signup",
            document.getElementById("ammd-auth"),
            ModalType.move
        );
    }
    
    prepare() {
        // Setup Google Auth2 using Google API
        gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: window.config.pv_gid,
                cookiepolicy: 'single_host_origin',
                fetch_basic_profile: true
            }).attachClickHandler(
                document.getElementById("am-pgoogle"), {}, (googleUser) => {
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
        });
    }
    
    /**
     * Logs in using a provider.
     * @param {string} authToken OpenID auth token.
     * @param {AuthProfile} profile Authorization profile
     */
    _login(authToken, profile) {
        Auth.shared()
            .then(async auth => {
                await auth.login(
                    new AuthData(authToken, profile)
                );
                
                // When finished just reload page
                // Page will obviously change which is why why must reload
                window.location.reload(true);
            })
            .catch(error => { throw error });
    }
}

document.getElementById("am-login").addEventListener("click", (event) => {
    ModalContext.shared.present(AuthModal.shared);
}, false);
