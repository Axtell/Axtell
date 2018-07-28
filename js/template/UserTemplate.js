import Template from '~/template/Template';
import SVG from '~/models/Request/SVG';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import FollowButtonController from '~/controllers/FollowButtonController';
import Auth from '~/models/Auth';

/**
 * A user template for a list of users (generates `li` nodes)
 */
export default class UserTemplate extends Template {
    /**
     * A user element generally in a list of more users. Really basic
     * @param {User} user - The user to display
     */
    constructor(user) {
        super(<li class="user-item"/>);

        /** @type {User} */
        this.user = user;

        /** @type {?FollowButtonController} */
        this.followButtonController = null;

        return (async () => {

            const auth = await Auth.shared;
            const isAuthorized = await auth.isAuthorized;

            let followColumn = <DocumentFragment/>;

            if (isAuthorized && !await user.isMe()) {
                const followButton = new ButtonTemplate({
                    icon: await SVG.load(user.isFollowing ? 'unfollow' : 'follow'),
                    text: user.isFollowing ? 'Unfollow' : 'follow',
                    color: ButtonColor.accentBorder
                });

                followButton.isActive = user.isFollowing;
                followButton.hasShadow = false;
                followButton.isSmall = true;

                const followButtonNode = followButton.unique();

                this.followButtonController = new FollowButtonController(followButtonNode, auth, user);

                followColumn = (
                    <div class="user-item__column">
                        { followButtonNode }
                    </div>
                );
            }

            const chevron = await SVG.load('right-chevron');
            this.underlyingNode.appendChild(
                <DocumentFragment>
                    <a href={ user.profilePage } target="_blank" class="user-item__column">
                        <img class="user-item__avatar" src={user.avatar} />
                    </a>
                    <a href={ user.profilePage } target="_blank" class="user-item__column user-item__column--size-wide user-item__name">
                        <span>{ user.name }</span>
                        { chevron }
                    </a>
                    { followColumn }
                </DocumentFragment>
            )

            return this;
        })();
    }
}
