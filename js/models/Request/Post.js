import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Describes a post.
 */
export default class Post extends Request {
    /**
     * Returns redirect URL
     * @return {string} redirect url
     */
    format(json) {
        return json.redirect;
    }

    /**
     * Creates a 'create post' request. Requires authorization
     * @param {string} title
     * @param {string} body Markdown body
     * @param {?number} ppcgId - if applicable. The ID of the respective PPCG post
     */
    constructor({ title, body, ppcgId }) {
        super({
            path: '/post/public',
            method: HTTPMethod.POST,
            formData: {
                'response-type': 'json',
                'post-title': title,
                'post-body': body,
                'post-ppcg-id': ppcgId
            },
            headers: {
                Accept: 'application/json'
            }
        })
    }
}
