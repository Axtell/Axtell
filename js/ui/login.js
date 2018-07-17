import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ModalViewController from '~/controllers/ModalViewController';
import Analytics, { EventType } from '~/models/Analytics';

const authModal = new AuthModalTemplate();
document.getElementById("am-login")?.addEventListener("click", (event) => {
    Analytics.shared?.report(EventType.loginOpen);
    ModalViewController.shared.present(authModal);
}, false);
