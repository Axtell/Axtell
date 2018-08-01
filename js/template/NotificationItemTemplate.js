import Template from '~/template/Template';
import SwappingTemplate from '~/template/SwappingTemplate';
import MarkNotificationStatus from '~/models/Request/MarkNotificationStatus';
import NotificationButtonTemplate from '~/template/NotificationButtonTemplate';
import Notification from '~/models/Notification';
import SVG from '~/models/Request/SVG';
import LoadingIcon from '~/svg/LoadingIcon';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

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

        /**
         * @type {NotificationGroup}
         */
        this.notificationGroup = notificationGroup;

        return (async () => {

            const NotificationStatus = await Notification.getStatuses();
            const status = await notificationGroup.getStatus();
            const unread = status !== NotificationStatus.read;
            const unreadIndicator = await SVG.load('unread');

            const markReadButton = await new NotificationButtonTemplate('Mark as read', 'mark-read')
            const markRead = markReadButton.unique();

            const state = unread ? 'unread' : 'read';
            const link = notificationGroup.primaryNotification.responder;

            this._unreadIconWrapper = (
                <div class={`notification__detail notification__detail--style-state notification__detail--state-${state}`}>
                    { unreadIndicator }
                </div>
            );

            this._markReadIcon = new SwappingTemplate(markReadButton.unique());
            this._loadingMarkedRead = new Template(LoadingIcon.cloneNode(true));
            this._markReadWrapper = (
                <div class="notification__detail notification__detail--size-small notification__detail--style-button">
                    { this._markReadIcon.unique() }
                </div>
            );

            this._markingRead = false;

            const responder = (
                <a href={link} target="_blank" class="notification__detail notification__detail--size-wide">
                    <h3>{notificationGroup.count} people outgolfed your answer.</h3>
                    <h4>Your JavaScript answer was outgolfed— try and outgolf them?</h4>
                </a>
            );

            root.appendChild(
                <DocumentFragment>
                    <div class="notification__details">
                        { this._unreadIconWrapper }
                        { responder }
                        { unread ? this._markReadWrapper : <DocumentFragment/> }
                    </div>
                </DocumentFragment>
            );

            responder.addEventListener('click', () => {
                this.markRead()
                    .catch(HandleUnhandledPromise);
            });

            this._markReadWrapper.addEventListener('click', () => {
                this.markRead()
                    .catch(HandleUnhandledPromise);
            });

            return this;
        })();
    }

    /**
     * Marks a notification as read and runs a request. Calls
     * {@link NotificationItemTemplate#markedRead}
     */
    async markRead() {
        if (this._markingRead) return;

        this._markReadIcon.controller.displayAlternate(this._loadingMarkedRead);
        this._markingRead = true;
        const NotificationStatus = await Notification.getStatuses();
        const markNotificationStatus = new MarkNotificationStatus(this.notificationGroup, NotificationStatus.read);
        await markNotificationStatus.run();
        this._markingRead = false;

        // Switch the checkmark to a loading icon
        this.markedRead();
    }

    /**
     * Marks a notification item read. Does not run request
     */
    markedRead() {
        // Switch from blue -> gray icon
        this._unreadIconWrapper.classList.remove('notification__detail--state-unread');
        this._unreadIconWrapper.classList.add('notification__detail--state-read');

        // Remove the read button
        if (this._markReadWrapper.parentNode) {
            this._markReadWrapper.parentNode.removeChild(this._markReadWrapper);
        }
    }
}
