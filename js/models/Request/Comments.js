import Request, { HTTPMethod } from '~/models/Request/Request';
import Comment, { COMMENT_COUNT } from '~/models/Comment';

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
     * @param {?number} parentId - The parent ID if loading a subcomment. `-1` if none
     * @param {?number} [intialOffset=COMMENT_COUNT] - How many are loaded before paging started counting
     */
    constructor({ type, id, page, parentId = -1, intialOffset = COMMENT_COUNT }) {
        super({
            path: `/${type}/${id}/comments/parent/${parentId}/page/${page}/offset/${intialOffset}`,
            method: HTTPMethod.GET
        });
    }
}
