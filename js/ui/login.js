import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ModalController from '~/controllers/ModalController';

document.getElementById("am-login")?.addEventListener("click", (event) => {
    ModalController.shared.present(AuthModalTemplate.shared);
}, false);
