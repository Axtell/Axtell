import Template from '~/template/Template';
import NotificationButtonTemplate from '~/template/NotificationButtonTemplate';
import Notification from '~/models/Notification';
import SVG from '~/models/Request/SVG';

/**
 * Represents a single notification.
 */
export default class NotificationItemTemplate extends Template {
    /**
     * @param {NotificationGroup} notificationGroup
     */
    constructor(notificationGroup) {
        const root = (
            <li class="notification notification-group"/>
        );
        super(root);

        return (async () => {

            const NotificationStatus = await Notification.getStatuses();
            const status = await notificationGroup.getStatus();
            const unread = status !== NotificationStatus.read;
            const unreadIndicator = await SVG.load('unread');

            let markRead = <DocumentFragment/>;

            if (unread) {
                const markReadButton = await new NotificationButtonTemplate('Mark as read', 'mark-read')
                markRead = markReadButton.unique();
            }

            const state = unread ? 'unread' : 'read';
            const link = notificationGroup.primaryNotification.responder;

            root.appendChild(
                <DocumentFragment>
                    <div class="notification__details">
                        <div class={`notification__detail notification__detail--style-state notification__detail--state-${state}`}>
                            { unreadIndicator }
                        </div>
                        <a href={link} target="_blank" class="notification__detail notification__detail--size-wide">
                            <h3>{notificationGroup.count} people outgolfed your answer.</h3>
                            <h4>Your JavaScript answer was outgolfed— try and outgolf them?</h4>
                        </a>
                        <div class="notification__detail notification__detail--size-small notification__detail--style-button">
                            { markRead }
                        </div>
                    </div>
                </DocumentFragment>
            );

            return this;
        })();
    }
}
