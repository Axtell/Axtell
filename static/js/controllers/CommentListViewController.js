import ViewController from '~/controllers/ViewController';
import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import LoadingIcon from '~/svg/LoadingIcon';

import markdown from '#/markdown-renderer';

export const OPACITY_TRANSITION_DURATION = 200; // in ms

/**
 * Manages a list of comments
 */
export default class CommentListViewController extends ViewController {
    /**
     * Creates the comment list controller from HTML element.
     * @param {HTMLElement} commentList physical element
     * @param {Post|Answer} owner The owner
     */
    constructor(commentList, owner) {
        super(commentList);

        // The original node for comment list.
        this._node = commentList;

        /** @type {Post|Answer} */
        this.owner = owner;

        WriteCommentViewController.forClass(
            'comment-write-init',
            (btn) => [btn, owner, this],
            commentList
        );
    }

    /**
     * Creates a 'loading' instance in this comment list.
     * @return {Object} has `.destroy()` function to destroy loading instance.
     */
    createLoadingInstance() {
        const loadingHTML = (
            <li class="comment-item comment-loading">
                { LoadingIcon.cloneNode(true) } Posting Comment...
            </li>
        );

        this._node.insertBefore(loadingHTML, this._node.firstChild);
        loadingHTML.style.opacity = 0;
        setTimeout(() => { loadingHTML.style.opacity = 1 }, OPACITY_TRANSITION_DURATION);

        return {
            destroy: () => {
                this._node.removeChild(loadingHTML);
            }
        }
    }

    /**
     * Reports an error
     */
    createErrorInstance(message) {
        // TODO:
    }

    createCommentInstance(comment) {
        const body = <div class="body"></div>;
        body.innerHTML = markdown.render(comment.text);

        const commentHTML = (
            <li class="comment-item comment-user-split comment">
                <div class="user">
                    <img class="avatar" src={comment.owner.avatar} />
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="name">{comment.owner.name}</span>
                    </div>
                    { body }
                </div>
            </li>
        );

        this._node.insertBefore(commentHTML, this._node.firstChild);
        commentHTML.style.opacity = 0;

        // Wait for transition to finish, then change
        setTimeout(() => { commentHTML.style.opacity = 1 }, OPACITY_TRANSITION_DURATION);
    }
}
