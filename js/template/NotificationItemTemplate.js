import Template from '~/template/Template';

/**
 * Represents a single notification.
 */
export default class NotificationItemTemplate extends Template {
    /**
     * @param {NotificationGroup} notificationGroup
     */
    constructor(notificationGroup) {
        const root = (
            <li class="notification-group">
            </li>
        );
        super(root);
    }
}
