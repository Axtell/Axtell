import PopoverTemplate from '~/template/PopoverTemplate';
import LoadingIcon from '~/template/PopoverTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import Notifications from '~/models/Request/Notifications';
import Notification from '~/models/Notification';

export default class NotificationListTemplate extends PopoverTemplate {
    /**
     * Creates a notifications list. Construction on
     * unauthorized user is undefined behavior.
     * @param {Object} opts - Options as in {@link PopoverTemplate}
     */
    constructor(opts) {
        const node = <div/>;
        super(node, {
            isFixed: true,
            isAlignedRight: true,
            hasResponsiveClose: true,
            ...opts
        });

        /** @private */
        this.root = <div/>;

        /** @private */
        this.rootSwapper = new LoadingTemplate();
        this.rootSwapper.loadInContext(node);

        /**
         * Gets notifications. Do not touch this.
         * @type {Notifications}
         */
        this.notifications = new Notifications();

        this._categories = [];
    }

    /**
     * Obtains header for a date. Same header = same categorization
     * @param {Date} date
     * @return {String}
     */
    headerForDate(date) {
        return moment(date).calendar(null, {
            sameDay: '[Today]',
            lastDay: '[Yesterday]',
            lastWeek: '[Last] dddd',
            sameElse: 'Older'
        })
    }

    /**
     * Finds a category by a name or returns a new category
     * @param {string} categoryHeader
     * @return {Object}
     */
    findCategory(categoryHeader) {
        for (const category of this._categories) {
            if (category.name === categoryHeader) {
                return category;
            }
        }

        const newCategory = { name: categoryHeader, items: [] };
        this._categories.push(newCategory);
        return newCategory;
    }


    /** @override */
    async didInitialLoad() {
        await super.didInitialLoad();

        const NotificationTypes = await Notification.getTypes();

        // We'll format this into an array of 'categories' i.e.
        // days. This will be in the format: `{ name: 'Today', items: [] }`
        // The items will be in the form `{ mostRecent: Notification, related: [] }`
        for await(const notification of this.notifications) {
            // We'll categorize these into categories
            const header = this.headerForDate(notification.dateCreated);
            const category = this.findCategory(header);

            category.items.push({ mostRecent: notification, related: [] })
        }
    }
}
