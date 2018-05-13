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
     * @param {String} body Markdown body
     */
    constructor({ title, body }) {
        super({
            path: '/post/public',
            method: HTTPMethod.POST,
            formData: {
                'post-title': title,
                'post-body': body
            },
            headers: {
                Accept: 'application/json'
            }
        })
    }
}
