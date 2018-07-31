import RemoteEnum, { EnumEndpoint } from '~/models/Request/RemoteEnum';

/**
 * See {@link Notification.getTypes}
 * @typedef {number} NotificationType
 */

/**
 * See {@link Notification.getStatuses}
 * @typedef {number} NotificationStatus
 */

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
        return await new RemoteEnum(EnumEndpoint.NotificationStatus).run();
    }

    /**
     * A notification
     * @param {string} options.id - Notification UUID
     * @param {User} options.recipient - Delivery user
     * @param {} options.dateCreated - The date created
     * @param {NotificationType} options.type - the notification type
     * @param {NotificationStatus} options.status - Read status
     */
    constructor({ id, recipient, dateCreated, type, status }) {
        this._id = id;
    }

    /**
     * The notification UUID
     * @readonly
     * @type {string}
     */
    get id() { return this._id; }

    /**
     * The notification recipient
     * @readonly
     * @type {User}
     */
    get recipient() { return this._recipient; }

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
     * @readonly
     * @type {NotificationStatus}
     */
    get status() { return this._status; }

    /**
     * Obtains the payload of the notification if possible.
     * @return {T} type depends on the notification
     */
    async getPayload() {
        // TODO:
    }

}
