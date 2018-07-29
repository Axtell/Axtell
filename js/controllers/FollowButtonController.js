import ViewController from '~/controllers/ViewController';
import FollowUser from '~/models/Request/FollowUser';
import SwappingViewController from '~/controllers/SwappingViewController';
import Template from '~/template/Template';
import SVG from '~/models/Request/SVG';

import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

/**
 * Creates a follow button. Expects an 'SVG' subelement for icon and a
 * 'span' element child to contain follow/unfollow text. This uses the
 * button classes (.button-active) in the active state.
 */
export default class FollowButtonController extends ViewController {

    /**
     * Sets up follow button with button node and user.
     * @param {HTMLElement} buttonNode - Should be a .button compliant button
     * @param {Auth} auth - Authorization instance
     * @param {User} user - User _to_ follow (expects authorized)
     */
    constructor(node, auth, user) {
        super(node);

        /** @private */
        this.auth = auth;

        /**
         * The user which this will follow
         * @type {User}
         */
        this.user = user;

        /**
         * The node
         * @type {HTMLElement}
         */
        this.node = node;

        /**
         * The icon
         * @type {SwappingViewController}
         */
        this.icon = new SwappingViewController(node.getElementsByTagName('svg')[0]);

        /**
         * The label
         * @type {SwappingViewController}
         */
        this.label = new SwappingViewController(node.getElementsByTagName('span')[0]);

        node.addEventListener('click', () => {
            this.toggle()
                .catch(HandleUnhandledPromise);
        });
    }

    /**
     * Toggles if following or not
     */
    async toggle() {
        if (this.user.isFollowing) {
            await this.unfollow();
        } else {
            await this.follow();
        }
    }

    /**
     * Unfollowers a user
     */
    async unfollow() {
        await new FollowUser(
            this.user,
            { shouldFollow: false }
        ).run();

        // So now show the 'follow' button
        this.icon.displayAlternate(new Template(await SVG.load('follow')));
        this.label.displayAlternate(Template.fromText('Follow'));

        this.node.classList.remove('button--active');
    }

    /**
     * Followers a user
     */
    async follow() {
        await new FollowUser(
            this.user,
            { shouldFollow: true }
        ).run();

        // So now show the 'unfollow' button
        this.icon.displayAlternate(new Template(await SVG.load('unfollow')));
        this.label.displayAlternate(Template.fromText('Unfollow'));

        this.node.classList.add('button--active');
    }

}
