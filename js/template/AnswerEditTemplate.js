import { CodeEditorThemeType } from '~/controllers/CodeEditorViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import NavigationItemDelegate from '~/delegate/NavigationItemDelegate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import CodeEditorTemplate from '~/template/CodeEditorTemplate';
import Template, { TemplateType } from '~/template/Template';
import SVG from '~/models/Request/SVG';
import Theme from "~/models/Theme";

/**
 * Does the whole 'edit box' thing. Delegate is `true` for saved `false` for canceled.
 */
export default class AnswerEditTemplate extends Template {
    /**
     * @param {Answer} answer - The original object
     */
    constructor(answer) {
        super(<div class="answer-edit"/>);

        /** @type {NavigationItemDelegate} */
        this.delegate = new NavigationItemDelegate();

        return (async () => {
            const CM = await CodeMirror();

            const cancelButton = new ButtonTemplate({
                text: 'cancel',
                color: ButtonColor.plain
            });

            const saveButton = new ProgressButtonTemplate({
                text: 'Save',
                icon: await SVG.load('save'),
                color: ButtonColor.green
            });

            cancelButton.delegate.didSetStateTo = (controller, state)  => {
                this.delegate.shouldClose(this, false);
            }

            saveButton.delegate.didSetStateTo = (controller, state) => {
                // TODO: save
                this.delegate.shouldClose(this, true);
            }

            const editor = await new CodeEditorTemplate();
            await editor.controller.setThemeType(CodeEditorThemeType.fromTheme(Theme.current));
            await editor.controller.setLanguage(answer.language);
            editor.controller.value = answer.code;

            this.underlyingNode.appendChild(
                <DocumentFragment>
                    { editor.unique() }
                    { cancelButton.unique() }
                    { saveButton.unique() }
                </DocumentFragment>
            );

            /** @type {ProgressButtonTemplate} */
            this.saveButton = saveButton;

            return this;
        })();
    }
}
