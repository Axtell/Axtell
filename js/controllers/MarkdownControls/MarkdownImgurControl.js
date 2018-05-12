import { MarkdownControlBuilder } from '~/template/MarkdownControl';
import ModalController from '~/controllers/ModalController';
import ImageUploadModalTemplate from '~/template/ImageUploadModalTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export default MarkdownControlBuilder(
    'Upload Image',
    'g',
    'picture',
    (controller) => {
        let modalTemplate = new ImageUploadModalTemplate();
        modalTemplate.delegate = new class extends ActionControllerDelegate {
            didSetStateTo(_, state) {
                controller.insertAtSelectionStart('![')
                controller.insertAtSelectionEnd(`](${state})`)
            }
        }

        ModalController.shared.present(modalTemplate);
    }
);
