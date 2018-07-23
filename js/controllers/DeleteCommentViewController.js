import ViewController from '~/controllers/ViewController';
import DeleteComment from '~/models/Request/DeleteComment';
import SwappingViewController from '~/controllers/SwappingViewController';
import Template from '~/template/Template'
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const CommentDeleteFailed = Symbol('Comment.Delete.Error.NetworkError');

/**
 * Deletes a comment
 */
export default class DeleteCommentViewController extends ViewController {

    /**
     * @param {HTMLElement} trigger - The delete button trigger
     * @param {CommentViewController} commentController
     */
    constructor(trigger, commentController) {
        super(trigger);

        /** @type {CommentViewController} */
        this.commentController = commentController;

        this.swappingController = new SwappingViewController(this.commentController.commentNode);

        trigger.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this comment?')) {
                this.trigger()
                    .catch(HandleUnhandledPromise);
            }
        })
    }

    /**
     * Triggers the delete process.
     */
    async trigger() {
        const request = new DeleteComment({
            comment: this.commentController.comment
        });

        // TODO: show a deleted screen
        // this.swappingController.displayAlternate();

        try {
            const result = await request.run();
        } catch(error) {
            ErrorManager.raise(`An error occured deleting the comment (ID ${this.commentController.comment.id}`, CommentDeleteFailed);
        }

        this.commentController.commentNode.parentNode.removeChild(this.commentController.commentNode);
    }

}
