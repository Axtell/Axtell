import AuthModal from '~/controllers/login/AuthModal';
import { ModalContext } from '~/controllers/Modal';

let loginHandler = document.getElementById("am-login");
if (loginHandler !== null) {
    loginHandler.addEventListener("click", (event) => {
        ModalContext.shared.present(AuthModal.shared);
    }, false);
}
