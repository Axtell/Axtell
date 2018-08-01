import Template from '~/template/Template';
import LoadingIcon from '~/svg/LoadingIcon';
import SwappingTemplate from '~/template/SwappingTemplate';
import Notification from '~/models/Notification';
import NotificationItemTemplate from '~/template/NotificationItemTemplate';
import MarkNotificationStatus from '~/models/Request/MarkNotificationStatus';
import NotificationButtonTemplate from '~/template/NotificationButtonTemplate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

/**
 * A category of notifications w/ a header
 */
export default class NotificationCategoryTemplate extends Template {
    /**
     * @param {NotificationCategory} notificationCategory
     * @async
     */
    constructor(notificationCategory) {

        const root = <ul class="notification-category"/>;
        super(root);

        /** @type {NotificationGroupTemplate[]} */
        this.notificationGroupTemplates = [];

        return (async () => {
            const checkAllButton = await new NotificationButtonTemplate('Mark all as read', 'check-all');
            const checkButton = checkAllButton.unique();
            checkAllButton.delegate.didSetStateTo = (_, state) => {
                // TODO: mark category as fixed
            };

            // Check if all children are read.
            const unread = await notificationCategory.getStatus();

            /** @private */
            this.checkAll = new SwappingTemplate(checkButton);

            /** @private */
            this.checkWrapper = (
                <div class="notification-category__detail">
                    { unread ? checkButton : <DocumentFragment/> }
                </div>
            );

            /** @private */
            this.loadingSign = new Template(LoadingIcon.cloneNode(true));

            /** @private */
            this.markingRead = false;

            root.appendChild(
                <DocumentFragment>
                    <li class="notification-category__title notification-category__stack">
                        <h3 class="notification-category__stack__primary">{notificationCategory.name}</h3>
                        { this.checkWrapper }
                    </li>
                </DocumentFragment>
            );

            for (const notificationGroup of notificationCategory) {
                const notificationGroupTemplate = await new NotificationItemTemplate(notificationGroup);
                this.notificationGroupTemplates.push(notificationGroupTemplate);
                notificationGroupTemplate.loadInContext(root);
            }

            /** @type {NotificationCategory} */
            this.notificationCategory = notificationCategory;

            checkButton.addEventListener('click', () => {
                this.markRead()
                    .catch(HandleUnhandledPromise);
            });

            return this;
        })();
    }

    /**
     * Marks all things as read under this
     */
    async markRead() {
        if (this.markingRead) return;


        this.checkAll.controller.displayAlternate(this.loadingSign);
        this.markingRead = true;
        const NotificationStatus = await Notification.getStatuses();
        const markNotificationStatus = new MarkNotificationStatus(this.notificationCategory, NotificationStatus.read);
        await markNotificationStatus.run();

        for (const group of this.notificationGroupTemplates) {
            group.markedRead();
        }

        this.markingRead = false;

        if (this.checkWrapper.parentNode) {
            this.checkWrapper.parentNode.removeChild(this.checkWrapper);
        }
    }
}
