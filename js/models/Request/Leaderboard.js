import Request, { HTTPMethod } from '~/models/Request/Request';
import Answer from '~/models/Answer';

/**
 * Obtains a post leaderboard
 */
export default class Leaderboard extends Request {
    /**
     * Returns the leaderboard object as a list of answers.
     * @param {Object} data
     * @return {Answer[]}
     */
    format(data) {
        return data.answers.map(Answer.fromJSON);
    }

    /**
     * Gets leaderboard for a post id
     * @param {number} postId - Id of post to get leaderboard for.
     */
    constructor({ postId }) {
        super({
            path: `/leaderboard/${postId}`,
            method: HTTPMethod.GET
        });
    }
}
