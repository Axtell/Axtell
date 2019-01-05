import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Deletes a given item
 * @extends {PublishEdit}
 */
export default class PublishNuke extends Request {
    /**
     * What to delete
     * @param {Post|Answer} item
     */
    constructor(item) {
        super({
            path: `/${item.endpoint}/nuke/${item.id}`,
            method: HTTPMethod.DELETE,
        });
    }
}
