import Request, { HTTPMethod } from '~/models/Request/Request';
import Enum from '~/models/Enum';

/**
 * @typedef {Object} EnumEndpoint
 * @property {string} notificationType - The types of a notification
 * @property {string} notificationStatus - The types of a notification
 */
export const EnumEndpoint = {
    notificationType: '/notification/enum/types',
    notificationStatus: '/notification/enum/statuses'
}

const cachedEnums = new Map();
/**
 * Loads a remote enum given a url
 * @extends {Request}
 */
export default class RemoteEnum extends Request {
    /** @override */
    format(json) {
        return Enum.fromJSON(json);
    }

    /** @override */
    async run() {
        if (cachedEnums.has(this._enumEndpoint)) {
            return cachedEnums.get(this._enumEndpoint);
        } else {
            const result = await super.run();
            cachedEnums.set(this._enumEndpoint, result);
            return result;
        }
    }

    /**
     * @param {EnumEndpoint} endpoint - The target endpoint
     */
    constructor(endpoint) {
        super({
            path: endpoint,
            method: HTTPMethod.GET
        });

        this._enumEndpoint = endpoint;
    }
}
