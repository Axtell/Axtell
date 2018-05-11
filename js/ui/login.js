import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ModalController from '~/controllers/ModalController';
import Analytics, { EventType } from '~/models/Analytics';

document.getElementById("am-login")?.addEventListener("click", (event) => {
    Analytics.shared?.report(EventType.loginOpen);
    ModalController.shared.present(AuthModalTemplate.shared);
}, false);
