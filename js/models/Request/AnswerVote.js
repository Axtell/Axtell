import Vote from '~/models/Request/Vote';

/**
 * Submits a vote request for an **answer**
 */
export default class AnswerVote extends Vote {
    /**
     * Sets the vote on an answer.
     * @param {number} answerId
     * @param {string} voteType
     * @param {boolean} idAdding - If the vote is being set or removed.
     */
    constructor({ answerId, voteType, isAdding }) {
        super(`/vote/answer/${answerId}`, voteType, isAdding);
    }
}
