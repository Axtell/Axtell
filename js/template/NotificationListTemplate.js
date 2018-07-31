import PopoverTemplate from '~/template/PopoverTemplate';
import LoadingIcon from '~/template/PopoverTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import NotificationCategoryTemplate from '~/template/NotificationCategoryTemplate';
import Notifications from '~/models/Request/Notifications';
import NotificationCategorizer from '~/models/NotificationCategorizer';
import Notification from '~/models/Notification';

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

        const NotificationTypes = await Notification.getTypes();
        const categorizer = new NotificationCategorizer();

        // We won't feed more than 10 itens
        for await(const notification of this.notifications) {
            categorizer.feedOnce(notification);
            if (categorizer.rowCount > 10) break;
        }

        for (const category of categorizer) {
            new NotificationCategoryTemplate(category).loadInContext(this.root);
        }

        this.rootSwapper.controller.displayAlternate(new Template(this.root));
    }
}
