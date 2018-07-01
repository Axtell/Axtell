import ModalController from '~/controllers/ModalController';
import ModalTemplate from '~/template/ModalTemplate';
import Theme from '~/models/Theme';
import LabelGroup from '~/template/Form/LabelGroup';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export const URL_REGEX = /^(((https?)?:)?\/\/)?([a-z0-9-]+\.)+([a-z0-9-]+)(\/.+)?$/i;

/**
 * Image upload Modal dialog.
 * @extends {ModalTemplate}
 */
export default class LinkModalTemplate extends ModalTemplate {
    /** @override */
    constructor() {
        const url = new TextInputTemplate(TextInputType.URL, 'https://example.com/');

        const button = new ButtonTemplate({
            text: 'Add Link',
            color: ButtonColor.blue
        });
        button.isSmall = true;
        button.hasPaddedTop = true;

        url.delegate.didSetStateTo = (_, value) => {
            if (URL_REGEX.test(value)) {
                button.setIsDisabled(false);
            } else {
                button.setIsDisabled(true, 'Invalid URL');
            }
        };

        super(
            "Add Link.",
            new LabelGroup('Link URL', url, {
                button: button
            }).unique()
        );

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        button.delegate.didSetStateTo = (_, state) => {
            this._insertWithURL(url.value);
        };
    }

    _insertWithURL(url) {
        this.delegate?.didSetStateTo(this, url);
        ModalController.shared.dismiss();
    }

}
