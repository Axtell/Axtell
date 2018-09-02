import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Adds webpush device. Returns device ID
 * @extends {Request}
 */
export default class WebPushNewDevice extends Request {

    /** @override */
    format(data) {
        return data.device_id;
    }

    /**
     * @param {PushSubscription} pushSubscription
     */
    constructor(pushSubscription) {
        super({
            path: '/webpush/register',
            method: HTTPMethod.POST,
            data: pushSubscription.toJSON()
        })
    }

}
