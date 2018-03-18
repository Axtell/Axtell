import ViewController from '~/controllers/ViewController';
import MarkdownViewController from '~/controllers/MarkdownViewController';
import * as MarkdownControls from '~/controllers/MarkdownControls';

import Comment from '~/models/Request/Comment';
import Answer from '~/models/Answer';

export const CommentError = Symbol('WriteComment.Error.submit');

/**
 * Manages a "Write Comment" button
 */
export default class WriteCommentViewController extends ViewController {
    /**
     * Creates the write commemt button
     * @param {HTMLElement} button The <a> init tag.
     * @param {Post|Answer} owner The owner
     * @param {CommentListViewController} parentList The list view which to place comment in.
     */
    constructor(button, owner, parentList) {
        super(button);

        this._node = button;

        this._commentText = <textarea placeholder="Your comment..." class="markdown shrink text-base comment-body" name="comment-body" type="text"></textarea>;


        this._cancel = <a class="cancel">cancel</a>;
        this._submit = <a class="submit button accent">submit</a>;
        this._writingBox = (
            <div class="comment-writer">
                <h5>Write Comment</h5>
                { this._commentText }
                <div class="comment-submit">
                    { this._cancel }
                    { this._submit }
                </div>
            </div>
        );

        // Setup markdown
        new MarkdownViewController(this._commentText, [
            new MarkdownControls.MarkdownBoldControl(),
            new MarkdownControls.MarkdownItalicControl()
        ]);

        this._displayingWritingBox = false;

        /** @type {Post|Answer} */
        this.owner = owner;

        /** @type {CommentListViewController} */
        this.parentList = parentList;

        this._node.addEventListener("click", ::this.toggleState);
        this._cancel.addEventListener("click", ::this.toggleState);

        this._submit.addEventListener("click", () => {
            this.submit()
                .catch((error) => ErrorManager.report(error));
        });
    }

    /**
     * Submits this form
     */
    async submit() {
        this.toggleState();
        if (this.owner instanceof Answer) {
            let instance = this.parentList.createLoadingInstance();

            try {
                let commentPost = new Comment({
                    type: 'answer',
                    id: this.owner.id,
                    value: this._commentText.value
                });

                const comment = await commentPost.send();

                this.parentList.createCommentInstance(comment);
            } catch (error) {
                // TODO: handle error
                let errorMessage = {
                    [400]: `Internal error in comment layout`,
                    [401]: `You must be authorized to vote`,
                    [500]: `Internal server error.`,
                }[error.response?.status] || `Unexpected error posting comment.`;

                this.parentList.createErrorInstance(errorMessage);
                ErrorManager.raise(errorMessage, CommentError)
            } finally {
                instance.destroy();
            }

        }
    }

    /**
     * Toggles between writing box and "add comment" dialogue.
     */
    toggleState() {
        if (this._displayingWritingBox) {
            this._writingBox.parentNode.replaceChild(this._node, this._writingBox);
            this._displayingWritingBox = false;
        } else {
            this._node.parentNode.replaceChild(this._writingBox, this._node);
            this._displayingWritingBox = true;
        }
    }
}
