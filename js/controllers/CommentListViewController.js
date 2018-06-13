import LoadMoreLocalCommentsViewController from '~/controllers/LoadMoreLocalCommentsViewController';
import LoadMoreCommentsViewController from '~/controllers/LoadMoreCommentsViewController';
import AnimationController, { Animation } from '~/controllers/AnimationController';
import WriteCommentViewController from '~/controllers/WriteCommentViewController';
import AnimationControllerDelegate from '~/delegate/AnimationControllerDelegate';
import ViewController from '~/controllers/ViewController';
import LoadingIcon from '~/svg/LoadingIcon';
import * as Decode from '~/helpers/Decode';
import Comment from '~/models/Comment';
import Theme from '~/models/Theme';
import Expand from '~/svg/Expand';
import Down from '~/svg/Down';

export const OPACITY_TRANSITION_DURATION = 200; // in ms

/**
 * Will construct a comment with everything setup.
 *
 * We have three types of thread expansion:
 *
 *  - See more static (i.e. local JSON) - =2 w 1=dynamic, >=3
 *  - See more dynamic (AJAX) - =1, =2 w 1=static,
 *  - Expand static (from local JSON) - Everything else
 *  - Expand dynamic (AJAX) - for depth=3 where depths 1&2 are static
 *
 * @param {Comment} comment - comment object itself.
 * @param {Object} opts - named options
 * @param {boolean} opts.recursive - if we should also init instead of adding <Expand> elemes
 * @return {HTMLElement} all setup etc.
 */
export async function constructComment(comment, opts = {}) {
    const { recursive = false } = opts;

    const body = <div class="body"></div>;
    const markdown = await import('#/markdown-renderer');
    body.innerHTML = markdown.render(comment.text);

    let seeMoreButton = <DocumentFragment/>,
        subComments = <DocumentFragment/>;

    const commentChildren = comment.children || [];
    if (recursive) {
        const recursiveDefaultShowAmt = 1;

        if (commentChildren.length > recursiveDefaultShowAmt) {
            seeMoreButton = (
                <li class="comment-item comment-item--action comment-item--hoverable comment-item__load-more">
                    { Down.cloneNode(true) }
                    See More
                </li>
            );
        }

        for (let i = 0; i < Math.min(recursiveDefaultShowAmt, commentChildren.length); i++) {
            let subComment = commentChildren[i];
            let elem = await constructComment(subComment, opts);
            subComments.appendChild(elem);
        }
    } else if (commentChildren.length > 0) {
        seeMoreButton = (
            <li class="comment-item comment-item--action comment-item--hoverable comment-item__expand">
                { Expand.cloneNode(true) }
                Expand
            </li>
        );
    }

    const childList = (
        <ul class="comment-list comment-list--nested">
            { seeMoreButton }
            <li class="comment--append-first-ref"></li>
            <li class="comment--append-ref"></li>
            { subComments }
            <li class="comment--prepend-ref"></li>
        </ul>
    );

    const commentNode = (
        <div class="comment-item comment__user_split comment">
            <div class="user">
                <img class="avatar" src={comment.owner.avatar} />
            </div>
            <div class="comment__content">
                <div class="comment__header">
                    <span class="comment__name">{comment.owner.name}</span>
                </div>
                { body }
                <div class="comment__footer">
                    <a class="comment__reply comment-item__write-init">reply</a>
                    <span class="comment__timestamp">{ moment(comment.date).fromNow() }</span>
                </div>
                { childList }
            </div>
        </div>
    );

    new CommentListViewController(childList, comment, {
        parentNode: commentNode
    });

    return commentNode;
}

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
     * @param {HTMLElement} commentList physical element
     * @param {Post|Answer} owner The owner
     * @param {Object} [opts={}]] additional options
     * @param {HTMLElement} [parentNode=commentList.parentNode] The parent node of this list
     */
    constructor(commentList, owner, { parentNode = commentList.parentNode } = {}) {
        super(commentList);

        // The original node for comment list.
        this._node = commentList;

        /** @type {Post|Answer|Comment} */
        this.owner = owner;

        // The location to prepend instances
        this._prependRef = immediateChildWithClass(this._node, 'comment--prepend-ref');
        this._appendRef = immediateChildWithClass(this._node, 'comment--append-ref');
        this._appendRefFirst = immediateChildWithClass(this._node, 'comment--append-first-ref');

        if (this.owner instanceof Comment) {
            // Is a nested comment
            new WriteCommentViewController(
                parentNode.querySelector('.comment-item__write-init'),
                owner,
                this
            );

            // This will fallback to AJAX if children = false
            const loadMoreButton = immediateChildWithClass(this._node, 'comment-item__load-more');
            const expandButton = immediateChildWithClass(this._node, 'comment-item__expand');

            if (loadMoreButton) {
                new LoadMoreCommentsViewController(
                    loadMoreButton,
                    owner,
                    this
                );
            }

            if (expandButton) {
                new LoadMoreCommentsViewController(
                    expandButton,
                    owner,
                    this,
                    true
                );
            }
        } else {
            new WriteCommentViewController(
                immediateChildWithClass(this._node, 'comment-item__write-init'),
                owner,
                this
            );

            const loadMoreButton = immediateChildWithClass(this._node, 'comment-item__load-more');
            if (loadMoreButton) {
                new LoadMoreCommentsViewController(
                    loadMoreButton,
                    owner,
                    this
                );
            }
        }
    }

    /**
     * For static construction this will setup the sublists
     * @param {boolean} [preferSeeMore=true] If we should prefer 'see more' button
     */
    setupSublists(preferSeeMore = true) {
        const children = this._node.children;
        for (let i = 0; i < children.length; i++) {
            if (children[i].classList.contains('comment')) {
                const sublist = new CommentListViewController(
                    children[i].querySelector('.comment-list'),
                    Comment.fromJSON(
                        Decode.b64toJSON(children[i].dataset.comment)
                    ),
                    { preferSeeMore: true }
                );
                sublist.setupSublists();
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
     * @param {Object} constructionOptions - options when constructing each comment
     * @return {HTMLElement} created element
     */
     async createMultipleCommentInstances(comments, type = InstanceType.prepend, animated = false, constructionOptions = {}) {
        const bodies = await Promise.all(
            comments.map(comment => constructComment(comment, constructionOptions))
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
