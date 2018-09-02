import Request, { HTTPMethod } from '~/models/Request/Request';
import Comment from '~/models/Comment';

/**
 * Submits a comment
 * @extends {Request}
 */
export default class WriteCommentRequest extends Request {
    /**
     * Returns the new comment object
     * @param {Object} data
     * @return {Comment}
     */
    format(data) {
        return Comment.fromJSON(data);
    }

    /**
     * Creates a new comment
     * @param {string} type - `post` or `answer`
     * @param {number|string} id - Id of post or answer
     * @param {string} value - Actual content of comment
     * @param {?number} parentComment - The id of the parent comment
     */
    constructor({ type, id, value, parentComment = null }) {
        super({
            path: `/${type}/comment/${id}`,
            method: HTTPMethod.POST,
            formData: {
                comment_text: value,
                parent_comment: parentComment
            }
        });
    }
}
