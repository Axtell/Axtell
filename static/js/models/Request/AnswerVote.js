import Request, { HTTPMethod } from '~/models/Request/Request';

// For now we'll alias the vote types to values
const typeValues = {
    'upvote': 1,
    'none': 0,
    'downvote': -1
};

/**
 * Submits a vote request for an **answer**
 */
export default class AnswerVote extends Request {
    /**
     * Returns `total` and `voted`.
     * @param {Object} data
     * @return {Object}
     */
    format(data) {
        return {
            total: data.breakdown[this._voteType],
            voted: data.vote === typeValues[this._voteType]
        }
    }

    /**
     * Sets the vote on an answer.
     * @param {number} answerId
     * @param {string} voteType
     * @param {boolean} idAdding - If the vote is being set or removed.
     */
    constructor({ answerId, voteType, isAdding }) {
        let voteTarget = isAdding ? voteType : 'none';

        super({
            path: `/vote/answer/${answerId}`,
            method: HTTPMethod.POST,
            data: {
                vote: typeValues[voteTarget]
            }
        });

        this._voteType = voteType;
    }
}
