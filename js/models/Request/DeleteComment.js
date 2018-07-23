import Request, { HTTPMethod } from '~/models/Request/Request';
import Comment from '~/models/Comment';

/**
 * Deletes a comment
 */
export default class DeleteCommentRequest extends Request {
    /**
     * Returns if was deleted
     * @return {boolean}
     */
    format(data) {
        return data.deleted && data.success;
    }

    /**
     * Deletes a comment
     * @param {Comment} comment - in place comment object
     */
    constructor({ comment }) {
        super({
            path: `/${comment.type}/${comment.sourceId}/comment/${comment.id}`,
            method: HTTPMethod.DELETE
        });
    }
}
