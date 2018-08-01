import RemoteEnum, { EnumEndpoint } from '~/models/Request/RemoteEnum';
import Theme from '~/models/Theme';
import User from '~/models/User';

/**
 * See {@link Notification.getTypes}
 * @typedef {number} NotificationType
 */

/**
 * See {@link Notification.getStatuses}
 * @typedef {number} NotificationStatus
 */

/**
 * @typedef {Object} NotificationCategory
 * @property {string} status
 * @property {string} answer
 * @property {string} postComment
 * @property {string} answerComment
 */
export const NotificationCategory = {
    status: 'status',
    answer: 'answer',
    postComment: 'post_comment',
    answerComment: 'answer_comment'
};

/**
 * Represents a notification
 * @implements {JSONConvertable}
 */
export default class Notification {

    /**
     * This returns an enumeration of notification types
     * @return {Enum} of the {@link NotificationType} enumeration
     */
    static async getTypes() {
        return await new RemoteEnum(EnumEndpoint.notificationType).run();
    }

    /**
     * This returns an enumeration of notification statuses
     * @return {Enum} of the {@link NotificationStatus} enumeration
     */
    static async getStatuses() {
        return await new RemoteEnum(EnumEndpoint.notificationStatus).run();
    }

    /**
     * A notification
     * @param {string} options.id - Notification UUID
     * @param {string} options.b
     * @param {string} options.body
     * @param {User} options.recipient - Delivery user
     * @param {User} options.sender - User who sent
     * @param {number} options.target - The ID of the target which triggered the notif
     * @param {number} options.source - the ID of the source which caused the context for recieving the notification
     * @param {string} options.category - The category based on a string for responder
     * @param {Date} options.dateCreated - The date created
     * @param {NotificationType} options.type - the notification type
     * @param {NotificationStatus} options.status - Read status
     */
    constructor({
        id,
        title,
        body,
        recipient,
        sender,
        target,
        source,
        category,
        dateCreated,
        type,
        status
    }) {
        this._id = id;
        this._title = title;
        this._body = body;
        this._recipient = recipient;
        this._sender = sender;
        this._target = target;
        this._category = category;
        this._source = source;
        this._dateCreated = dateCreated;
        this._type = type;
        this._status = status;
    }

    /**
     * @param {Object} json
     * @return {Notification}
     */
    static fromJSON(json) {
        return new Notification({
            id: json.id,
            title: json.title,
            body: json.body,
            recipient: User.fromJSON(json.recipient),
            sender: User.fromJSON(json.sender),
            target: json.target_id,
            source: json.source_id,
            category: json.category,
            dateCreated: new Date(json.date_created),
            type: json.type,
            status: json.status
        })
    }

    /**
     * Obtains responder URL
     * @readonly
     * @type {string}
     */
    get responder() {
        return `/responder/${this.id}/${this.category}/${this.target}`;
    }

    /**
     * Obtains Icon URL
     * @return {string}
     */
    async getIconURL() {
        const NotificationType = await Notification.getTypes();
        const key = NotificationType.keyForValue(this.type);
        return Theme.current.staticImageForTheme(`notification-icon/${key}`);
    }

    /**
     * Gets the body
     * @type {string}
     */
    get body() { return this._body; }

    /**
     * Gets the title
     * @type {string}
     */
    getTitle() { return this._title; }

    /**
     * The notification UUID
     * @readonly
     * @type {string}
     */
    get id() { return this._id; }

    /**
     * Obtains the category
     * @readonly
     * @type {NotificationCategory}
     */
    get category() { return this._category; }

    /**
     * The notification recipient
     * @readonly
     * @type {User}
     */
    get recipient() { return this._recipient; }

    /**
     * The notification sender
     * @readonly
     * @type {User}
     */
    get sender() { return this._sender; }

    /**
     * The target ID
     * @readonly
     * @type {number}
     */
    get target() { return this._target; }

    /**
     * The source ID. This is the post that resulted in the
     * notification subscription. For example in "A new answer
     * to your post". This would be the Post ID.
     * @readonly
     * @type {number}
     */
    get source() { return this._source; }

    /**
     * The notification creationdate
     * @readonly
     * @type {Date}
     */
    get dateCreated() { return this._dateCreated; }

    /*
     * The notification type
     * @readonly
     * @type {NotificationType}
     */
    get type() { return this._type; }

    /*
     * The notification read status
     * @type {NotificationStatus}
     */
    get status() { return this._status; }

    /**
     * Sets the status of this notification
     * @type {NotificationStatus}
     */
    set status(newStatus) { this._status = newStatus; }

    /**
     * Obtains the payload of the notification if possible.
     * @return {T} type depends on the notification
     */
    async getPayload() {
        // TODO:
    }

}
