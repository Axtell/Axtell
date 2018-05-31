import { MarkdownControlBuilder } from '~/template/MarkdownControl';
import ModalController from '~/controllers/ModalController';
import MathEditorModalTemplate from '~/template/MathEditorModalTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export default MarkdownControlBuilder(
    'Add Equation',
    'e',
    'equation',
    (controller) => {
        let modalTemplate = new MathEditorModalTemplate(controller.selection);

        modalTemplate.delegate = new class extends ActionControllerDelegate {
            didSetStateTo(_, state) {
                controller.insertForSelection(`\n\n$$ ${state} $$\n\n`);
            }
        }

        ModalController.shared.present(modalTemplate);
    }
);
