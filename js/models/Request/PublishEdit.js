import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Represents an edit on a post or answer
 * @extends {Request}
 */
export default class PublishEdit extends Request {
    /** @override */
    format(json) {
        return this._item.constructor.fromJSON(json);
    }

    /**
     * @param {Object} options
     * @param {Answer|Post} options.item
     * @param {?(Answer|Post)} options.original An original can be passed to only change the changes
     * @param {boolean} [options.deleted=undefined] If should delete
     */
    constructor({
        item,
        original,
        deleted
    }) {
        let options = {};

        if (original) {
            const originalJSON = original.toJSON();
            const newJSON = item.toJSON();

            for (let key in newJSON) {
                // We'll exclude certain keys
                if (key === 'owner' ||
                    key === 'id') continue;

                if (newJSON.hasOwnProperty(key) && originalJSON.hasOwnProperty(key) &&
                    newJSON[key] !== originalJSON[key]) {
                    options[key] = newJSON[key];
                }
            }
        } else {
            options = item.toJSON();
        }

        super({
            path: `/${item.endpoint}/edit/${item.id}`,
            method: HTTPMethod.POST,
            data: {
                ...options,
                deleted: deleted
            }
        });
        this._item = item;
    }
}
