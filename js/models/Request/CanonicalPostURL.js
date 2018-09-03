import Request from '~/models/Request/Request';

/**
 * Obtains canonical URL of a post
 * @extends {Request}
 */
export default class CanonicalPostURL extends Request {
    /** @override */
    format(json) {
        return json.url;
    }

    /**
     * Pass the post object or the post ID
     * @param {number|Post} post
     */
    constructor(post) {
        const postId = post.id || post;
        super({
            path: `/post/canonical_url/${postId}`
        })
    }
}
