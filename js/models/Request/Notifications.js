import { HTTPMethod } from '~/models/Request/Request';
import PagedRequest from '~/models/Request/PagedRequest';
import Notification from '~/models/Notification';

/**
 * Obtains a series of Notification objects
 */
export default class Notifications extends PagedRequest {
    /**
     * Returns if was deleted
     * @return {boolean}
     */
    format(notificationJSON) {
        return Notification.fromJSON(notificationJSON);
    }

    /**
     * Requires authorization. Undefined behavior if not, what
     * is likely going to happen is a 401 error but just don't
     * call without auth.
     */
    constructor() {
        super({
            path: `/notifications/all`,
            method: HTTPMethod.GET
        });
    }
}
