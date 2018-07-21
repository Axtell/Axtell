import ViewController from '~/controllers/ViewController';
import { InstanceType } from '~/controllers/CommentListViewController';
import Comment from '~/models/Comment';

import Comments from '~/models/Request/Comments';

export const CommentLoadError = Symbol('WriteComment.Error.load');

/**
 * Manages the "Load More" button
 */
export default class LoadMoreCommentsViewController extends ViewController {
    /**
     * Creates the write commemt button
     * @param {HTMLElement} button The loading button
     * @param {Post|Answer} owner The owner post
     * @param {CommentListViewController} parentList The list view which to place comment in.
     * @param {boolean} [shouldExpand=false] Follows 'expansion' semantics
     */
    constructor(button, owner, parentList, shouldExpand = false) {
        super(button);

        this._node = button;

        /** @type {Post|Answer} */
        this.owner = owner;

        /** @type {CommentListViewController} */
        this.parentList = parentList;

        /** @type {number} */
        this.pageIndex = 1;

        /** @type {boolean} */
        this.shouldExpand = shouldExpand;

        this._node.addEventListener("click", () => {
            this.loadNextPage();
        });
    }

    /**
     * Submits this form
     */
    async loadNextPage() {
        if (this.isLoading) return;

        this.isLoading = true;

        // Get commments
        const { areMore, comments } = await this.contentsForPage(this.pageIndex++);

        await this.parentList.createMultipleCommentInstances(comments, InstanceType.append, true, {
            expandRecursively: this.shouldExpand
        });

        // If they aren't any more comments we'll remove this
        if (!areMore) {
            this._node.parentNode.removeChild(this._node);
        }

        this.isLoading = false;
    }

    /**
     * Gets the comments for a given page
     * @return {Object}
     * @property {boolean} areMore If they are more pages
     * @property {Comment[]} comments Additional comments
     */
    async contentsForPage(pageNumber) {
        const endpoint = do {
            if (this.owner instanceof Comment) {
                new Comments({
                    type: this.owner.type,
                    id: this.owner.sourceId,
                    page: pageNumber,
                    parentId: this.owner.id,
                    intialOffset: this.shouldExpand ? 0 : 1
                })
            } else {
                new Comments({
                    type: this.owner.endpoint,
                    id: this.owner.id,
                    page: pageNumber
                })
            }
        };

        const commentData = await endpoint.run();
        commentData.comments.reverse();
        return commentData;
    }

    _isLoading = false;
    _loadingInstance = null;
    /**
     * Gets the loading status
     * @return {Boolean}
     */
    get isLoading() { return this._isLoading }

    /**
     * Sets the loading status
     * @type {boolean}
     */
    set isLoading(isLoading) {
        this._isLoading = isLoading;
        if (isLoading) {
            this._node.classList.add('comment-item--disabled', 'tooltip');
            this._node.title = "Loading...";
            this._loadingInstance = this.parentList.createLoadingInstance("Loading comments...", InstanceType.appendFirst);
        } else {
            this._node.classList.remove('comment-item--disabled', 'tooltip');
            this._loadingInstance?.destroy();
            this._loadingInstance = null;
        }
    }
}
