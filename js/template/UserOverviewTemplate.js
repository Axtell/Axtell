import Template, { TemplateType } from '~/template/Template';
import LoadingIcon from '~/svg/LoadingIcon';

/**
 * A template representing a user.
 */
export default class LanguageTemplate extends Template {
    /**
     * @param {UserRequest} userRequest the request of the user to show.
     */
    constructor(userRequest) {
        const body = (
            <div>{ LoadingIcon.cloneNode(true) }</div>
        );

        super(body);

        /** @private */
        this.body = body;

        /** @private */
        this.userRequest = userRequest;
    }

    /** @override */
    willLoad() {
        super.willLoad();

        this.userRequest
            .run()
            .then(::this.prepareView);
    }

    /**
     * Prepares user preview
     * @param {User} user user to show
     */
    prepareView(user) {
        const userOverview = (
            <div class="user-popup">
                <img class="user-popup__avatar" src={ user.avatar }  />
                <h4 class="user-popup__username">{ user.name }</h4>
                <ul class="user-popup__stats">
                    <li class="user-popup__stat">
                        <span class="user-popup__stat__value">{ user.answerCount || "N/A" }</span>
                        <span class="user-popup__stat__name">Answers</span>
                    </li>
                    <li class="user-popup__stat">
                        <span class="user-popup__stat__value">{ user.postCount || "N/A" }</span>
                        <span class="user-popup__stat__name">Posts</span>
                    </li>
                </ul>
                <a href={user.profilePage} class="button button--size-wide button--color-accent">View Profile</a>
            </div>
        );

        this.body.parentNode.replaceChild(userOverview, this.body);
    }
}
