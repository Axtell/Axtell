import Request, { HTTPMethod } from '~/models/Request/Request';
import 'navigator.sendbeacon'; // Polyfill

/**
 * A request with beacon flag. Do note: very few features are supported.
 * Additionally the HTTPMethod is **always** POST.
 */
export default class BeaconableRequest extends Request {
    /**
     * Runs optionally with beacon
     * @param {Object} o - inherits opts from {@link Request}
     * @param {boolean} o.useBeacon - Uses navigator.sendBeacon
     * @override
     */
    async run({ useBeacon = false, ...opts } = {}) {
        if (useBeacon) {
            let data = null;
            if (this._data instanceof FormData ||
                this._data instanceof Blob ||
                this._data instanceof URLSearchParams) {
                data = this._data
            } else if (typeof this._data === 'object') {
                data = new Blob([JSON.stringify(this._data)], { type: 'application/json' });
            }

            navigator.sendBeacon(this._path, data);
        } else {
            return await super.run(opts);
        }
    }

    /**
     * Same constructor as {@link Request}
     * @param {Object} opts
     * @override
     */
    constructor({ ...opts }) {
        super({
            ...opts,
            method: HTTPMethod.POST
        })
    }
}
