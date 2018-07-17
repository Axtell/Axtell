import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ModalViewController from '~/controllers/ModalViewController';
import Analytics, { EventType } from '~/models/Analytics';

const authButton = document.getElementById("am-login");
if (authButton) {
    const authModal = new AuthModalTemplate();
    authButton.addEventListener("click", (event) => {
        Analytics.shared?.report(EventType.loginOpen);
        ModalViewController.shared.present(authModal);
    }, false);
}
