import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Obtains notification data
 */
export default class Leaderboard extends Request {
    /**
     * Returns the notification data as an object
     * @param {Object} data
     * @return {Object}
     * @property {number} unseenCount - Amount of unseen notifications
     */
    format(data) {
        return {
            unseenCount: data.unseen_count
        };
    }

    /**
     * Only requires authorization
     */
    constructor() {
        super({
            path: `/notifications/status`,
            method: HTTPMethod.GET
        });
    }
}
