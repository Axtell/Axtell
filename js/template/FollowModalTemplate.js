import AnimationController, { Animation } from '~/controllers/AnimationController';
import FollowedUser, { FollowedType } from '~/models/Request/FollowedUser';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import { ButtonColor } from '~/template/ButtonTemplate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import ModalViewTemplate from '~/template/ModalViewTemplate';
import SwappingTemplate from '~/template/SwappingTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import UserTemplate from '~/template/UserTemplate';
import Template from '~/template/Template';
import SVG from '~/models/Request/SVG';

/**
 * @typedef {Object} FollowType
 * @property {Object} followers
 * @property {Object} following
 */
export const FollowType = {
    followers: {
        title: 'Followers',
        description: 'View {}\'s public followers',
        negative: 'No followers',
        endpoint: 'followers',
        requestType: FollowedType.followers
    },
    following: {
        title: 'Following',
        description: 'View who {} is following',
        endpoint: 'following',
        negative: 'Not following anyone',
        requestType: FollowedType.following
    }
};

/**
 * The modal showing followers or following.
 */
export default class FollowModalTemplate extends ModalViewTemplate {
    /**
     * Creates the modal which can be re-used
     * @param {User} user - The user to get modal for
     * @param {FollowType} followType - What to show, followers or following?
     */
    constructor(user, followType) {
        super({
            title: `${followType.title}.`,
            subtitle: followType.description.replace(/{}/g, user.name),
            requestedWidth: 500
        });

        /**
         * The loading sign (i.e. body of this)
         * @protected
         * @type {LoadingTemplate}
         */
        this.loadingSign = new LoadingTemplate();

        this.body.appendChild(
            <DocumentFragment>
                { this.loadingSign.unique() }
            </DocumentFragment>
        );

        /** @private */
        this.userList = <ul class="user-item__list"/>;

        /** @type {User} */
        this.user = user;

        /** @type {FollowType} */
        this.followType = followType;

        /**
         * The request, don't call since it'll
         * mess up pagination.
         * @type {FollowedUser}
         */
        this.request = new FollowedUser(user, followType.requestType);
    }

    /** @override */
    async didInitialLoad() {
        const areUsers = await this.nextPage(false);

        if (areUsers) {
            // Already populated
            this.loadingSign.controller.displayAlternate(new Template(this.userList));
        } else {
            this.loadingSign.controller.displayAlternate(new Template(
                <h3 class="user-item__empty">{ this.followType.negative } 😞</h3>
            ));
        }
    }

    /**
     * Loads the next page
     * @param {boolean} animated - if the addition of new nodes should be animated
     * @return {boolean} True if was able to load anything
     */
    async nextPage(animated = true) {
        const users = await this.request.nextPage();
        if (users.length === 0) return false;

        const subList = <ul class="user-item__sublist" />;

        // Load all items into a temporary list
        await Promise.all(
            users.map(async user => {
                const template = await new UserTemplate(user);
                template.loadInContext(subList);
            })
        );

        const newSublist = <li class="user-item__sublist_wrap">{ subList }</li>;
        this.userList.appendChild(newSublist);

        if (animated) {
            const animationController = new AnimationController(
                newSublist,
                [ Animation.expand.height ]
            );
            animationController.triggerAnimation();
        }


        // Create & style the load more button
        if (this.request.areMore) {
            const loadMore = new ProgressButtonTemplate({
                icon: await SVG.load('down'),
                color: ButtonColor.plain,
                text: 'Load More'
            });

            loadMore.isWide = true;
            loadMore.hasPaddedTop = true;

            loadMore.loadInContext(this.userList);
            loadMore.delegate.didSetStateTo = async (button, state) => {
                await this.nextPage(true);
                button.removeFromContext();
            }
        }

        return true;
    }
}
