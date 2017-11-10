import { ModalContext, Modal, ModalType } from '~/controllers/Modal';

class AuthModal extends Modal {
    constructor() {
        super(
            "Login or Signup",
            document.getElementById("ammd-auth"),
            ModalType.move
        );
    }
}

document.getElementById("am-login").addEventListener("click", (event) => {
    ModalContext.shared.present(AuthModal.shared);
}, false);
