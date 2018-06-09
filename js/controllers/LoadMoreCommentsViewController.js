import ViewController from '~/controllers/ViewController';
import { InstanceType } from '~/controllers/CommentListViewController';

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
     */
    constructor(button, owner, parentList) {
        super(button);

        this._node = button;

        /** @type {Post|Answer} */
        this.owner = owner;

        /** @type {CommentListViewController} */
        this.parentList = parentList;

        /** @type {number} */
        this.pageIndex = 1;

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
        const { areMore, comments } = await new Comments({
            type: this.owner.endpoint,
            id: this.owner.id,
            page: this.pageIndex++
        }).run();

        await this.parentList.createMultipleCommentInstances(comments, InstanceType.append, true);

        // If they aren't any more comments we'll remove this
        if (!areMore) {
            this._node.parentNode.removeChild(this._node);
        }

        this.isLoading = false;
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
