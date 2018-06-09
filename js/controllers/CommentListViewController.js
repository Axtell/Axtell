import ViewController from '~/controllers/ViewController';
import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import LoadMoreCommentsViewController from '~/controllers/LoadMoreCommentsViewController';
import AnimationController, { Animation } from '~/controllers/AnimationController';
import AnimationControllerDelegate from '~/delegate/AnimationControllerDelegate';
import LoadingIcon from '~/svg/LoadingIcon';

export const OPACITY_TRANSITION_DURATION = 200; // in ms

async function constructComment(comment) {
    const body = <div class="body"></div>;
    const markdown = await import('#/markdown-renderer');
    body.innerHTML = markdown.render(comment.text);

    return (
        <div class="comment-item comment__user_split comment">
            <div class="user">
                <img class="avatar" src={comment.owner.avatar} />
            </div>
            <div class="comment__content">
                <div class="comment__header">
                    <span class="name">{comment.owner.name}</span>
                    <span class="timestamp"> &middot; { moment(comment.date).fromNow() }</span>
                </div>
                { body }
            </div>
        </div>
    );
}

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
        this._appendRefFirst = this._node.getElementsByClassName('comment--append-first-ref')[0];

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
     * @param {boolean} [animated=true] If we should animate element
     * @return {Object} has `async .destroy()` function to destroy loading instance. Also `.node`
     */
    createLoadingInstance(message, type = InstanceType.prepend, animated = true) {
        const loadingHTML = (
            <li class="comment-item comment-loading">
                { LoadingIcon.cloneNode(true) } { message }
            </li>
        );

        let animationController = animated ? new AnimationController(
                loadingHTML,
                [ Animation.expand.height ]
        ) : null;

        this.addInstance(loadingHTML, type);

        if (animationController !== null) {
            animationController.triggerAnimation();
            animationController.delegate.didUnfinishAnimation = (controller) => {
                this._node.removeChild(loadingHTML);
            }
        }

        // Make sure the loading instance lasts at least 100ms
        return {
            node: loadingHTML,
            destroy: () => {
                if (animationController === null) {
                    this._node.removeChild(loadingHTML);
                } else {
                    animationController.untriggerAnimation();
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

    /**
     * Creates a comment in the list
     * @param {Comment} comment The comment to add
     * @param {InstanceType} type Where it should be added
     * @return {HTMLElement} created element
     */
    async createCommentInstance(comment, type = InstanceType.prepend) {
        const commentContent = await constructComment(comment);
        const commentHTML = <li>{ commentContent }</li>;

        this.addInstance(commentHTML, type);
        return commentHTML;
    }

    /**
     * Creates a 'grouped comment' instance. i.e. group of comments
     * @param {Comment[]} comments List of all comments
     * @param {InstanceType} type Where it should be added
     * @param {boolean} [animated=false] If should be animated
     * @return {HTMLElement} created element
     */
     async createMultipleCommentInstances(comments, type = InstanceType.prepend, animated = false) {
        const bodies = await Promise.all(
            comments.reverse().map(comment => constructComment(comment))
        );

        const commentHTML = <li>{ bodies }</li>;
        this.addInstance(commentHTML, type);

        if (animated) {
            const animationController = new AnimationController(
                commentHTML,
                [ Animation.expand.height ]
            );
            animationController.triggerAnimation();
        }

        return commentHTML;
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
    appendFirst: Symbol('CommentList.InstanceType.appendFirst'),

    getReference(ty, commentList) {
        if (ty === InstanceType.append) return commentList._appendRef.nextSibling;
        else if (ty === InstanceType.prepend) return commentList._prependRef;
        else if (ty === InstanceType.appendFirst) return commentList._appendRefFirst;
        else return null;
    }
};
