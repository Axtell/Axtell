import Notification from '~/models/Notification';

/**
 * Represents a notification group
 */
export class NotificationGroup {
    /**
     * @param {Notification} primaryNotification - The primary (and most recent) notification
     * @param {Notification[]} siblings - Related notifs w/ same action
     */
    constructor(primaryNotification, siblings) {
        /** @type {Notification} */
        this.primaryNotification = primaryNotification;

        /** @type {Notification[]} */
        this.siblings = siblings;
    }

    /**
     * Returns the total count of notifications
     * @return {number}
     */
    get count() { return 1 + this.siblings.length; }

    /**
     * Iterates over all groups in this
     * @return {Generator<Notification>}
     */
    *[Symbol.iterator]() {
        yield this.primaryNotification;
        yield* this.siblings;
    }

    /**
     * Returns all IDs
     * @return {Generator<string>}
     */
    *getIds() {
        for (const notification of this) {
            yield notification.id;
        }
    }

    /**
     * Returns if any item in the group is unread
     * @return {NotificationStatus}
     */
    async getStatus() {
        const NotificationStatus = await Notification.getStatuses();

        if (this.primaryNotification.status === NotificationStatus.unseen)
            return NotificationStatus.unseen;

        let hasUnread = false;
        for (const notification of this.siblings) {
            if (notification.status === NotificationStatus.unseen)
                return NotificationStatus.unseen;

            if (notification.status === NotificationStatus.seen)
                hasUnread = true;
        }

        if (hasUnread)
            return NotificationStatus.seen;

        return this.primaryNotification.status;
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
     * Returns if any item in the group is unread
     * @return {NotificationStatus}
     */
    async getStatus() {
        const NotificationStatus = await Notification.getStatuses();

        let hasUnread = false;
        for (const notificationGroup of this) {
            const status = await notificationGroup.getStatus();
            if (status === NotificationStatus.unseen)
                return NotificationStatus.unseen;

            if (status === NotificationStatus.seen)
                hasUnread = true;
        }

        if (hasUnread)
            return NotificationStatus.seen;

        return NotificationStatus.read;
    }

    /**
     * Returns all IDs
     * @return {Generator<string>}
     */
    *getIds() {
        for (const group of this) {
            yield* group.getIds();
        }
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
        this._days = new Set();
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
     * The amount of days this covers
     */
    get dayCount() { return this._days; }

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
        this.registerNotificationMetadata(notification);
        this.addNotificationWithSiblings(category, notification);
    }

    /**
     * Registers a notification as an instance
     * @param {Notification} notification
     */
    registerNotificationMetadata(notification) {
        const notificationDay = moment(notification.creationDate).startOf('day').unix()
        this._days.add(notificationDay);
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
