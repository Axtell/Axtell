import Request, { HTTPMethod } from '~/models/Request/Request';

// For now we'll alias the vote types to values
const typeValues = {
    'upvote': 1,
    'none': 0,
    'downvote': -1
};

/**
 * A generic voting type
 * @abstract
 */
export default class Vote extends Request {
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
     * @param {string} url url endpoint
     * @param {string} voteType
     * @param {boolean} isAdding if is being set.
     */
    constructor(url, voteType, isAdding) {
        let voteTarget = isAdding ? voteType : 'none';

        super({
            path: url,
            method: HTTPMethod.POST,
            data: {
                vote: typeValues[voteTarget]
            }
        });

        this._voteType = voteType;
    }
}
