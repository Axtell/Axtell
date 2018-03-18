import { MarkdownControlBuilder } from '~/template/MarkdownControl';
import ModalController from '~/controllers/ModalController';
import ImageUploadModalTemplate from '~/template/ImageUploadModalTemplate';

export default MarkdownControlBuilder(
    'Upload Image',
    'g',
    'picture',
    (controller) => {
        let modalTemplate = new ImageUploadModalTemplate(controller);
        ModalController.shared.present(modalTemplate);
    }
);
