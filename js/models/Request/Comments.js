import Request, { HTTPMethod } from '~/models/Request/Request';
import Comment from '~/models/Comment';

/**
 * Obtains paginated comments
 */
export default class CommentsRequest extends Request {
    /**
     * Returns the new comment object
     * @param {Object} data
     * @return {Object} in format `comments: Comment[], areMore: bool`
     */
    format(data) {
        return {
            comments: data.comments.map(Comment.fromJSON),
            areMore: data.are_more
        }
    }

    /**
     * Creates a new comment
     * @param {string} type - `post` or `answer`
     * @param {number|string} id - Id of post or answer
     * @param {number} page - Comment page number (0-indexed)
     */
    constructor({ type, id, page }) {
        super({
            path: `/${type}/${id}/comments/page/${page}`,
            method: HTTPMethod.GET
        });
    }
}
