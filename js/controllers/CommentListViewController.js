import ViewController from '~/controllers/ViewController';
import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import LoadMoreCommentsViewController from '~/controllers/LoadMoreCommentsViewController';
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

        // The location to prepend instances
        this._prependRef = this._node.getElementsByClassName('comment--prepend-ref')[0];
        this._appendRef = this._node.getElementsByClassName('comment--append-ref')[0];

        WriteCommentViewController.forClass(
            'comment-item--write-init',
            (btn) => [btn, owner, this],
            commentList
        );

        LoadMoreCommentsViewController.forClass(
            'comment-item--load-more',
            (btn) => [btn, owner, this],
            commentList
        );
    }

    /**
     * Creates a 'loading' instance in this comment list.
     * @param {string} message what to display in box
     * @param {InstanceType} type The type of instance to add
     * @return {Object} has `async .destroy()` function to destroy loading instance.
     */
    createLoadingInstance(message, type = InstanceType.prepend) {
        const loadingHTML = (
            <li class="comment-item comment-loading">
                { LoadingIcon.cloneNode(true) } { message }
            </li>
        );

        this.addInstance(loadingHTML, type);

        // Make sure the loading instance lasts at least 100ms
        const creationTime = new Date();

        const destroyNow = () => {
            this._node.removeChild(loadingHTML);
        }

        return {
            destroyNow,
            destroy: () => {
                // How much time elapsed since we made
                const timeSinceCreation = new Date() - creationTime;
                const timeLeft = 600 - timeSinceCreation;
                if (timeLeft > 0) {
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            destroyNow();
                            resolve();
                        }, timeLeft);
                    });
                } else {
                    destroyNow();
                }
            }
        }
    }

    /**
     * Reports an error
     */
    createErrorInstance(message) {
        // TODO:
    }

    createCommentInstance(comment, type = InstanceType.prepend) {
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
                        <span class="timestamp">{ moment(comment.date).fromNow() }</span>
                    </div>
                    { body }
                </div>
            </li>
        );

        this.addInstance(commentHTML, type);
    }

    /**
     * Adds an instance
     * @param {HTMLElement} html HTML node
     * @param {InstanceType} type The instance type
     */
    addInstance(html, type) {
        const ref = InstanceType.getReference(type, this);

        this._node.insertBefore(html, ref);
        html.style.opacity = 0;

        // Wait for transition to finish, then change
        setTimeout(() => { html.style.opacity = 1 }, OPACITY_TRANSITION_DURATION);
    }
}

export const InstanceType = {
    append: Symbol('CommentList.InstanceType.append'),
    prepend: Symbol('CommentList.InstanceType.prepend'),

    getReference(ty, commentList) {
        if (ty === InstanceType.append) return commentList._appendRef.nextSibling;
        else if (ty === InstanceType.prepend) return commentList._prependRef;
        else return null;
    }
};
