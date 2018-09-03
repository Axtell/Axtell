import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Obtains the Web Push certificate/public key
 * @extends {Request}
 */
export default class WebPushKey extends Request {

    /** @override */
    format(data) {
        return new Uint8Array(data);
    }

    constructor() {
        super({
            path: '/webpush/key',
            method: HTTPMethod.GET,
            responseType: 'arraybuffer'
        })
    }

}
