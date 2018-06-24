import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Represents an edit on a post or answer
 */
export default class PublishEdit extends Request {
    /** @override */
    format(json) {
        return this._item.constructor.fromJSON(json);
    }

    /**
     * @param {Object} options
     * @param {Answer|Post} options.item
     * @param {boolean} [options.deleted=false] If should delete
     */
    constructor({
        item,
        deleted = false
    }) {
        super({
            path: `/${item.endpoint}/${item.id}/edit`,
            method: HTTPMethod.POST,
            formData: {
                deleted: deleted
            }
        });
        this._item = item;
    }
}
