import Template from '~/template/Template';
import PopoverTemplate from '~/template/PopoverTemplate';
import LoadingIcon from '~/template/PopoverTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

import PushNotificationRequestTemplate from '~/template/PushNotificationRequestTemplate';
import NoNewNotificationsTemplate from '~/template/NoNewNotificationsTemplate';
import MarkNotificationStatus, { NotificationMarkAll } from '~/models/Request/MarkNotificationStatus';
import NotificationCategoryTemplate from '~/template/NotificationCategoryTemplate';
import NotificationCategorizer from '~/models/NotificationCategorizer';
import Notifications from '~/models/Request/Notifications';
import Notification from '~/models/Notification';
import PushNotification from '~/models/PushNotifications';

export default class NotificationListTemplate extends PopoverTemplate {
    /**
     * Creates a notifications list. Construction on
     * unauthorized user is undefined behavior.
     * @param {Object} opts - Options as in {@link PopoverTemplate}
     */
    constructor(opts) {
        const rootSwapper = new LoadingTemplate();
        super(rootSwapper.unique(), {
            isFixed: true,
            isAlignedRight: true,
            hasResponsiveClose: true,
            ...opts
        });

        /** @private */
        this.root = <div class="notification-list"/>;

        /** @private */
        this.rootSwapper = rootSwapper;

        /**
         * Gets notifications. Do not touch this.
         * @type {Notifications}
         */
        this.notifications = new Notifications();
    }


    /** @override */
    async didInitialLoad() {
        await super.didInitialLoad();

        // Prevent from getting smaller
        this.underlyingNode.style.minWidth = '370px'; // Minimum width
        // Force re-compute
        this.underlyingNode.getBoundingClientRect();
        this.underlyingNode.style.minWidth = getComputedStyle(this.underlyingNode).width;

        if (PushNotification.shared.shouldShowRequest) {
            const pushNotificationTemplate = await new PushNotificationRequestTemplate(PushNotification.shared);
            pushNotificationTemplate.loadInContext(this.root);
        }

        // Load the notifs
        const NotificationTypes = await Notification.getTypes();
        const categorizer = new NotificationCategorizer();

        // We won't feed more than 10 itens
        for await(const notification of this.notifications) {
            categorizer.feedOnce(notification);

            // Don't load more than three days
            if (categorizer.dayCount > 3) break;
        }

        // If they aren't any notifications
        if (categorizer.rowCount === 0) {
            // Show the bell
            const noNewNotifications = await new NoNewNotificationsTemplate();
            noNewNotifications.loadInContext(this.root);
        }

        // None of these will be called if no notifs
        for (const category of categorizer) {
            const categoryTemplate = await new NotificationCategoryTemplate(category);
            categoryTemplate.loadInContext(this.root);
        }

        this.rootSwapper.controller.displayAlternate(new Template(this.root));
    }

    /** @override */
    didLoad() {
        super.didLoad();

        (async () => {

            const NotificationStatus = await Notification.getStatuses();
            const markStatus = new MarkNotificationStatus(NotificationMarkAll, NotificationStatus.seen);
            await markStatus.run({ useBeacon: true });

        })().catch(HandleUnhandledPromise);
    }
}
