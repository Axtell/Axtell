import ViewController from '~/controllers/ViewController';
import LeaderboardItemTemplate from '~/template/LeaderboardItemTemplate';
import Leaderboard from '~/models/Request/Leaderboard';
import ErrorManager from '~/helpers/ErrorManager';

/**
 * Leaderboard buttons and all.
 */
export default class LeaderboardViewController extends ViewController {
    /**
     * Manages an existing leaderboard instance. Provide the post instance
     * also.
     *
     * @param {string} element element id.
     * @param {Post} post Post which leaderboard represents.
     */
    constructor(element, post) {
        super();
        element.controller = this;

        /** @private */
        this.elem = element;

        /** @private */
        this.body = element.tBodies[0];

        /**
         * Post managed
         * @type {Post}
         */
        this.post = post;

        /** @private */
        this.seeMore = this.elem.parentNode.getElementsByClassName('lvc-reveal')[0];
        if (this.seeMore) {
            this.seeMore.addEventListener("click", () => {
                this.showMore().catch(error => {
                    ErrorManager.silent(
                        error,
                        `Failed to obtain further leaderboard data`
                    );
                });
            });
        }

        /**
         * Number of items in leaderboard
         * @type {number}
         */
        this.atIndex = this.body.children.length;
    }

    /**
     * Shows more leaderboard options
     */
    async showMore() {
        let leaderboard = await new Leaderboard({
            postId: this.post.id
        }).get();

        // Remove already existing ones
        leaderboard.splice(0, this.atIndex);

        leaderboard.forEach(answer => {
            this.atIndex += 1;
            let template = new LeaderboardItemTemplate(answer, this.atIndex);
            template.loadInContext(this.body);
        });

        this.seeMore.parentNode.removeChild(this.seeMore);
    }
}
