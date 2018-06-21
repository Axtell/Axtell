import LoadMoreCommentsViewController from '~/controllers/LoadMoreCommentsViewController';

export const LOCAL_SHOW_COUNT = 3;
export default class LoadMoreLocalCommentsViewController extends LoadMoreCommentsViewController {
    /**
     * Gets the comments for a given page
     * @return {Object}
     * @property {boolean} areMore If they are more pages
     * @property {Comment[]} comments Additional comments
     */
    async contentsForPage(pageNumber) {
        console.log(pageNumber);
        const lowerBound = LOCAL_SHOW_COUNT * (pageNumber - 1) + 1;
        const upperBound = LOCAL_SHOW_COUNT * (pageNumber - 0) + 1;
        const comments = this.owner.children.slice(
            -upperBound, // 1, 4, 7, 10, ...
            -lowerBound  // 4, 7, 10, 14, ...
        ).reverse();

        const areMore = upperBound < this.owner.children.length;

        return { areMore, comments };
    }
}
