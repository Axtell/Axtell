import ViewController from '~/controllers/ViewController';
import NotificationData from '~/models/Request/NotificationData';
import PopoverViewController from '~/controllers/PopoverViewController';
import NotificationListTemplate from '~/template/NotificationListTemplate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import Template, { TemplateType } from '~/template/Template';

/**
 * Notification bubble to click on
 */
export default class NotificationBubbleViewController extends ViewController {
    /**
     * @param {Element} bubble The wrapper bubble
     * @param {Element} dropdownContainer - relative point to add dropdown
     */
    constructor(bubble, dropdownContainer) {
        super(bubble);

        this._overlay = <div class="notification-button__overlay notification-button__overlay--indicator-count"/>;

        this._countText = document.createTextNode('');
        this._overlayText = <div class="notification-button__overlay notification-button__overlay--text"><span>{ this._countText }</span></div>;

        bubble.appendChild(this._overlay);
        bubble.appendChild(this._overlayText);

        const notificationList = new NotificationListTemplate();
        dropdownContainer.appendChild(notificationList.unique());

        const popover = new PopoverViewController(
            null,
            bubble,
            notificationList
        );

        popover.delegate.didSetStateTo = (_, state) => {
            if (state) {
                this.hideCount()
                    .catch(HandleUnhandledPromise);
            }
        };

        return (async () => {
            const notificationData = await new NotificationData().run();

            if (notificationData.unseenCount > 0) {
                await this.showCount(notificationData.unseenCount);
            }

            return this;
        })();
    }

    /**
     * Displays the count of unseen
     * @param {number} count
     */
    async showCount(count) {
        const anime = await import('animejs');

        this._countText.data = String(count);
        anime.timeline()
            .add({
                targets: this._overlay,
                width: ['0%', '100%'],
                height: ['0%', '100%'],
                easing: 'easeOutElastic',
                elasticity: 300,
                duration: 700
            })
            .add({
                targets: this._overlayText,
                fontSize: ['0em', '1em'],
                easing: 'easeOutElastic',
                elasticity: 600,
                duration: 1200,
                offset: 100
            });
    }

    /**
     * Hides the count of unseen notifs
     */
    async hideCount() {
        const anime = await import('animejs');

        anime.timeline()
            .add({
                targets: this._overlayText,
                fontSize: 0,
                easing: 'easeInElastic',
                elasticity: 300,
                duration: 700
            })
            .add({
                targets: this._overlay,
                width: 0,
                height: 0,
                easing: 'easeInElastic',
                elasticity: 600,
                duration: 900,
                offset: 0
            });
    }
}

