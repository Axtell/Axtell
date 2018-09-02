import { NotificationCategory, NotificationGroup } from '~/models/NotificationCategorizer';
import Notification from '~/models/Notification';
import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Pass to mark all notifications
 * @typedef {Symbol} NotificationMarkAllUnseen
 */
export const NotificationMarkAll = Symbol('MarkNotificationStatus.NotificationMarkAll')

/**
 * This sets notification status
 * @extends {Request}
 */
export default class MarkNotificationStatus extends Request {
    /**
     * Marks the passed notifications as something (this is async constructor).
     * @param {Notification|NotificationMarkAllUnseen|Notification[]|NotificationCategory|NotificationGroup|string[]} notifications - Some group of notifications. If you pass strings they must be the IDs
     * @param {NotificationStatus} status
     */
    constructor(notifications, status) {
        let endpoint = null,
            data = null;

        if (notifications === NotificationMarkAll) {
            endpoint = `/notifications/all`;
        } else if (notifications instanceof Notification) {
            endpoint = `/notification/${notifications.id}`;
        } else if (notifications instanceof Array) {
            endpoint = `/notifications`;
            data = notifications.map(notification =>
                typeof notification === 'string'
                ? notification
                : notification.id);
        } else if (notifications instanceof NotificationCategory ||
                notifications instanceof NotificationGroup) {
            endpoint = `/notifications`
            data = [...notifications.getIds()]
        } else {
            throw new TypeError('Unexpected type of `notifications` argument to MarkNotificationStatus');
        }

        super({
            path: `${endpoint}/mark/${status}`,
            method: HTTPMethod.POST,
            data: { ids: data }
        });
    }
}
