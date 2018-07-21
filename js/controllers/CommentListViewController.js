import LoadMoreCommentsViewController from '~/controllers/LoadMoreCommentsViewController';
import CommentViewController from '~/controllers/CommentViewController';
import CommentTemplate from '~/template/CommentTemplate';
import AnimationController, { Animation } from '~/controllers/AnimationController';
import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import AnimationControllerDelegate from '~/delegate/AnimationControllerDelegate';
import ViewController from '~/controllers/ViewController';
import LoadingIcon from '~/svg/LoadingIcon';
import * as Decode from '~/helpers/Decode';
import Comment from '~/models/Comment';
import Theme from '~/models/Theme';

export const OPACITY_TRANSITION_DURATION = 200; // in ms

function immediateChildWithClass(el, className) {
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i].classList.contains(className)) {
            return children[i];
        }
    }
    return null;
}

/**
 * Manages a list of comments
 */
export default class CommentListViewController extends ViewController {
    /**
     * Creates the comment list controller from HTML element.
     * @param {HTMLElement} comment - List physical element
     * @param {Post|Answer} owner - The owner
     * @param {Object} [opts={}]] - additional options
     */
    constructor(commentList, owner) {
        super(commentList);

        // The original node for comment list.
        this._node = commentList;

        /** @type {Post|Answer|Comment} */
        this.owner = owner;

        // The location to prepend instances
        this._prependRef = immediateChildWithClass(this._node, 'comment--prepend-ref');
        this._appendRef = immediateChildWithClass(this._node, 'comment--append-ref');
        this._appendRefFirst = immediateChildWithClass(this._node, 'comment--append-first-ref');

        // if there is a 'Write Comment' big button
        const writeCommentButton = immediateChildWithClass(this._node, 'comment-item__write-init');
        if (writeCommentButton) {
            new WriteCommentViewController(
                writeCommentButton,
                owner,
                this
            );
        }

        // Both of these probably don't exist
        const loadMoreButton = immediateChildWithClass(this._node, 'comment-item__load-more');

        if (loadMoreButton) {
            // If we should use Expand Button versus Load More button
            const preferExpand = loadMoreButton.classList.contains('comment-item__load-more--expand');

            new LoadMoreCommentsViewController(
                loadMoreButton,
                owner,
                this,
                preferExpand
            );
        }
    }

    /**
     * For static construction this will setup the sublists
     */
    setupSublists() {
        const children = this._node.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains('comment')) {
                const sublist = new CommentViewController(
                    children[i],
                    Comment.fromJSON(
                        Decode.b64toJSON(children[i].dataset.comment)
                    )
                );
                sublist.subCommentList.setupSublists();
            }
        }
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
        const commentContent = await new CommentTemplate(comment);
        const commentHTML = <li/>;
        commentContent.loadInContext(commentHTML);

        this.addInstance(commentHTML, type);
        return commentHTML;
    }

    /**
     * Creates a 'grouped comment' instance. i.e. group of comments. The difference between this and calling
     * `createCommentInstance` multiple times is this will perform a proper animation of the nodes.
     *
     * @param {Comment[]} comments List of all comments
     * @param {InstanceType} type Where it should be added
     * @param {boolean} [animated=false] If should be animated
     * @param {Object} constructionOptions - options when constructing each comment
     * @return {HTMLElement} created element
     */
     async createMultipleCommentInstances(comments, type = InstanceType.prepend, animated = false, constructionOptions = {}) {
        const bodies = await Promise.all(
            comments.map(comment => new CommentTemplate(comment, constructionOptions))
        );

        const commentHTML = <li/>;
        for (let i = 0; i < bodies.length; i++) {
            bodies[i].loadInContext(commentHTML);
        }

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
