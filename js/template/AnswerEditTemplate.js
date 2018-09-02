import { CodeEditorThemeType } from '~/controllers/CodeEditorViewController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import NavigationItemDelegate from '~/delegate/NavigationItemDelegate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import CodeEditorTemplate from '~/template/CodeEditorTemplate';
import Template, { TemplateType } from '~/template/Template';
import SVG from '~/models/Request/SVG';
import Answer from '~/models/Answer';
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
        this.navigationDelegate = new NavigationItemDelegate();

        /** @type {ActionControllerDelegate} */
        this.actionDelegate = new ActionControllerDelegate();

        return (async () => {
            const editor = await new CodeEditorTemplate();
            await editor.controller.setThemeType(CodeEditorThemeType.fromTheme(Theme.current));
            await editor.controller.setLanguage(answer.language);
            editor.controller.autoresize = true;
            editor.controller.value = answer.code;

            editor.controller.delegate.didSetStateTo = (controller, value) => {
                this.actionDelegate.didSetStateTo(this, value);
                this.checkIsDisabled(value);
            };


            const cancelButton = new ButtonTemplate({
                text: 'cancel',
                color: ButtonColor.plain
            });

            const saveButton = new ProgressButtonTemplate({
                text: 'Save',
                icon: await SVG.load('save'),
                color: ButtonColor.green
            });

            cancelButton.delegate.didSetStateTo = async (controller, state)  => {
                this.navigationDelegate.shouldClose(this, null);
            }

            saveButton.delegate.didSetStateTo = async (controller, state) => {
                const newAnswer = answer.clone();
                newAnswer.code = editor.controller.value;

                await this.navigationDelegate.shouldClose(this, newAnswer);
            }

            /** @type {Answer} */
            this.answer = answer;

            /** @private */
            this.cancelButton = cancelButton;

            /** @private */
            this.saveButton = saveButton;

            this.underlyingNode.appendChild(
                <DocumentFragment>
                    { editor.unique() }
                    { saveButton.unique() }
                    { cancelButton.unique() }
                </DocumentFragment>
            );

            /** @type {ProgressButtonTemplate} */
            this.saveButton = saveButton;

            // Queue this next tick
            this.checkIsDisabled(this.answer.code);

            return this;
        })();
    }

    /**
     * Checks if should disable the save button
     * @param {string} value What to compare with
     */
    checkIsDisabled(value) {
        if (this.answer.code === value) {
            this.saveButton.setIsDisabled(true, 'No changes to save.');
        } else {
            this.saveButton.setIsDisabled(false);
        }
    }
}
