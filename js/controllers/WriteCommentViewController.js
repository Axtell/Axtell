import ViewController from '~/controllers/ViewController';
import MarkdownViewController from '~/controllers/MarkdownViewController';
import * as MarkdownControls from '~/controllers/MarkdownControls';

import WriteComment from '~/models/Request/WriteComment';
import Analytics, { EventType } from '~/models/Analytics';
import ErrorManager from '~/helpers/ErrorManager';
import KeyManager from '~/models/KeyManager';
import Comment from '~/models/Comment';
import Answer from '~/models/Answer';
import Auth from '~/models/Auth';
import Post from '~/models/Post';
import Data from '~/models/Data';

export const CommentError = Symbol('WriteComment.Error.submit');
export const CommentOwnerTypeError = Symbol('WriteComment.Error.ownerType');

export const CommentLengthBounds = [
    +Data.shared.envValueForKey('MIN_COMMENT_LENGTH'),
    +Data.shared.envValueForKey('MAX_COMMENT_LENGTH')
];

/**
 * Manages a "Write Comment" button
 */
export default class WriteCommentViewController extends ViewController {
    /**
     * Creates the write commemt button
     * @param {HTMLElement} button The <a> init tag.
     * @param {Post|Answer|Comment} owner The owner
     * @param {CommentListViewController} parentList The list view which to place comment in.
     */
    constructor(button, owner, parentList) {
        super(button);

        this._node = button;

        this._commentText = <textarea placeholder="Your comment..." class="markdown shrink text-base comment-body" name="comment-body" type="text"></textarea>;


        this._cancel = <a class="cancel">cancel</a>;
        this._submit = <a class="submit button button--color-accent">submit</a>;
        this._writingBox = (
            <div class="comment-writer">
                <h5>Write Comment</h5>
                { this._commentText }
                <div class="comment-submit">
                    <span class="info">Must be between {CommentLengthBounds[0]} and {CommentLengthBounds[1]} characters.</span>
                    { this._cancel }
                    { this._submit }
                </div>
            </div>
        );

        this._keyBinding = null;

        // Setup markdown
        new MarkdownViewController(this._commentText, [
            new MarkdownControls.MarkdownBoldControl(),
            new MarkdownControls.MarkdownItalicControl(),
            new MarkdownControls.MarkdownStrikethroughControl()
        ]);

        this._displayingWritingBox = false;

        /** @type {Post|Answer|Comment} */
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
        const text = this._commentText.value;
        if (text.length < CommentLengthBounds[0] || text.length > CommentLengthBounds[1]) {
            Analytics.shared.report(EventType.commentTooShort);

            // Display error message
            return;
        }

        this.toggleState();

        const type = this.owner instanceof Comment ? this.owner.type : this.owner.endpoint;
        const sourceId = this.owner instanceof Comment ? this.owner.sourceId : this.owner.id;
        const instance = this.parentList.createLoadingInstance("Posting comment...");
        const parentComment = this.owner instanceof Comment ? this.owner.id : null;

        Analytics.shared.report(EventType.commentWrite(this.owner));

        try {
            let commentPost = new WriteComment({
                type: type,
                id: sourceId,
                value: text,
                parentComment: parentComment
            });

            const comment = await commentPost.run();

            // Reset the box
            this._commentText.value = "";

            await instance.destroy();
            await this.parentList.createCommentInstance(comment);
        } catch (error) {
            // TODO: handle error
            let errorMessage = {
                [400]: `Internal error in comment layout`,
                [401]: `You must be authorized to vote`,
                [500]: `Internal server error.`,
            }[error.response?.status] || `Unexpected error posting comment.`;

            await instance.destroy();

            this.parentList.createErrorInstance(errorMessage);
            ErrorManager.silent(error, errorMessage);
        }
    }

    _submitHandler = null;
    /**
     * Toggles between writing box and "add comment" dialogue.
     */
    async toggleState() {
        if (this._displayingWritingBox) {
            Analytics.shared.report(EventType.commentWriteClose(this.owner));
            this._writingBox.parentNode.replaceChild(this._node, this._writingBox);
            this._displayingWritingBox = false;

            this._keyBinding?.();
            this._keyBinding = null;

            this._submitHandler?.();
        } else {

            // When we try to display box
            const auth = await Auth.shared;
            if (!await auth.ensureLoggedIn()) return;

            Analytics.shared.report(EventType.commentWriteOpen(this.owner));
            this._node.parentNode.replaceChild(this._writingBox, this._node);
            this._displayingWritingBox = true;
            this._commentText.focus();

            this._keyBinding = KeyManager.shared.register('Escape', () => {
                this.toggleState();
            });

            this._submitHandler?.();
            this._submitHandler = KeyManager.shared.registerMeta('Enter', () => {
                this.submit();
            });
        }
    }
}
