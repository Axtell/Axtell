import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ModalController from '~/controllers/ModalController';

let loginHandler = document.getElementById("am-login");
if (loginHandler !== null) {
    loginHandler.addEventListener("click", (event) => {
        ModalController.shared.present(AuthModalTemplate.shared);
    }, false);
}
