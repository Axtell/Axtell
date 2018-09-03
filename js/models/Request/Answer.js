import Request, { HTTPMethod } from '~/models/Request/Request';

/**
 * Sends an new answer.
 * @extends {Request}
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
     * @param {string} code - Code as a valid JS string
     * @param {string} commentary - markdown commentary to submit
     * @param {Post} post - The post we are replying to
     * @param {Encoding} encoding - The encoding to use.
     * @param {Language} language - The language to use
     */
    constructor({ code, post, language, encoding, commentary }) {
        super({
            path: '/answer/public',
            method: HTTPMethod.POST,
            formData: {
                'post_id': post.id,
                'code': Buffer.from(code).toString('base64'),
                'lang_id': language.id,
                'encoding': encoding.name,
                'commentary': commentary
            },
            headers: {
                Accept: 'application/json'
            }
        })
    }
}
