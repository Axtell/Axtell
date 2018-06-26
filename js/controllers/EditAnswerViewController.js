import PostButtonViewController from '~/controllers/PostButtonViewController';
import SwappingViewController from '~/controllers/SwappingViewController';
import Analytics, { EventType } from '~/models/Analytics';
import PublishEdit from '~/models/Request/PublishEdit';
import ErrorManager from '~/helpers/ErrorManager';

export default class EditAnswerViewController extends PostButtonViewController {
    static activeEditInstance = null;

    /**
     * @param {Object} o options
     * @param {HTMLElement} o.trigger Trigger for deletion
     * @param {AnswerViewController} o.answerController the controller for the answer
     */
    constructor({ trigger, answerController }) {
        super(trigger);

        /** @type {AnswerViewController} */
        this.answerController = answerController;

        /** @type {Answer} */
        this.answer = this.answerController.answer;

        /** @private */
        this.editor = new SwappingViewController(this.answerController.getBody());

        trigger.addEventListener("click", ::this.trigger);

        /** @type {boolean} */
        this.isEditing = false;
    }

    /**
     * Open editor
     */
    async trigger() {
        if (this.isEditing) return;
        this.isEditing = true;

        EditAnswerViewController.activeEditInstance?.untrigger(false);
        EditAnswerViewController.activeEditInstance = this;

        Analytics.shared.report(EventType.answerEditClick(this.answer));

        this.isLoading = true;

        // Load the template
        const { default: AnswerEditTemplate } = await import('~/template/AnswerEditTemplate');
        const answerEditor = await new AnswerEditTemplate(this.answer);
        this.editor.displayAlternate(answerEditor);

        answerEditor.delegate.shouldClose = (controller, context) => {
            this.untrigger(context);
        };

        this.isLoading = false;
        this.isDisabled = true;
    }

    /**
     * Submits edits
     * @return {Answer} The new answer object
     */
    async edit() {
        const publishEdit = new PublishEdit({
            item: this.answer
        });
        return await publishEdit.run();
    }

    /**
     * Close editor
     * @param {boolean} changesUpdated - If the changes should be displayed
     */
    untrigger(changesUpdated = false) {
        if (!this.isEditing) return;
        this.isEditing = false;

        this.isDisabled = false;
        this.editor.restoreOriginal();

        if (changesUpdated) {
            Analytics.shared.report(EventType.answerEdited(this.answer));
        } else {
            Analytics.shared.report(EventType.answerNotEdited(this.answer));
        }
        EditAnswerViewController.activeEditInstance = null;
    }
}
