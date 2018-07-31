/**
 * Represents a notification group
 */
export class NotificationGroup {
    /**
     * @param {Notification} primaryNotification - The primary (and most recent) notification
     * @param {Notification[]} siblings - Related notifs w/ same action
     */
    constructor(primaryNotification, notificationGroups) {
        this.primaryNotification = primaryNotification;
        this.notificationGroups = notificationGroups;
    }
}

/**
 * Represents a notification category
 */
export class NotificationCategory {
    /**
     * @param {string} name
     * @param {NotificationGroup[]} notification groups expects in sorted order.
     */
    constructor(name, notificationGroups) {
        /**
         * Time-based name of category
         * @type {string}
         */
        this.name = name;

        /**
         * Prefer the generator
         * @type {NotificationGroup[]}
         */
        this.notificationGroups = notificationGroups;
    }

    /**
     * This iterates in sorted order
     */
    *[Symbol.iterator]() {
        yield* this.notificationGroups;
    }
}

/**
 * Categorizes notifications
 */
export default class NotificationCategorizer {
    /**
     * Creates empty categorizer.
     */
    constructor() {
        this._categories = [];
        this._groupCount = 0;
    }

    *[Symbol.iterator]() {
        for (const category of this._categories) {
            const categoryGroups = category.items.map(
                ({ mostRecent, related }) => new NotificationGroup(mostRecent, related))
            yield new NotificationCategory(category.name, categoryGroups)
        }
    }

    /**
     * The amount of unique items
     * @readonly
     * @type {number}
     */
    get rowCount() { return this._groupCount; }

    /**
     * Takes in a notification iterator. Assumes aync
     * @param {Generator<Notification>} notificationIterator,
     */
    async feed(notificationIterator) {
        for await(const notification of notificationIterator) {
            this.feedOnce(notification);
        }
    }

    /**
     * Feeds a single notification in
     * @param {Notification} notification
     */
    feedOnce(notification) {
        const header = this.headerForDate(notification.dateCreated);
        const category = this.findCategory(header);
        this.addNotificationWithSiblings(category, notification);
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

    /**
     * Attempts to find a notification's siblings in a category
     * @param {Category} category
     * @param {Notification} notification
     * @return {Object} A notification group object. Creates new if not exist
     */
    addNotificationWithSiblings(category, notification) {
        for (const notificationGroup of category.items) {
            const primaryNotification = notificationGroup.mostRecent;
            if (primaryNotification.type === notification.type &&
                primaryNotification.source === notification.source) {
                notificationGroup.related.push(notification);
                return notificationGroup;
            }
        }

        this._groupCount += 1;

        // TODO: ensure balancing of this
        category.items.push({
            mostRecent: notification,
            related: []
        });
    }
}
