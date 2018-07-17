import { MarkdownControlBuilder } from '~/template/MarkdownControl';
import ModalController from '~/controllers/ModalController';
import LinkModalTemplate from '~/template/LinkModalTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export default MarkdownControlBuilder(
    'Insert Link',
    'k',
    'link',
    (controller) => {
        let modalTemplate = new LinkModalTemplate();
        modalTemplate.delegate = new class extends ActionControllerDelegate {
            didSetStateTo(_, link) {
                controller.insertAtSelectionStart('[')
                controller.insertAtSelectionEnd(`](${link})`)
            }
        }

        ModalController.shared.present(modalTemplate);
    }
);
