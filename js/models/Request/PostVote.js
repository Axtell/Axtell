import Vote from '~/models/Request/Vote';

/**
 * Submits a vote request for a **post**
 * @extends {Vote}
 */
export default class PostVote extends Vote {
    /**
     * Sets the vote on an answer.
     * @param {number} postId
     * @param {string} voteType
     * @param {boolean} idAdding - If the vote is being set or removed.
     */
    constructor({ postId, voteType, isAdding }) {
        super(`/vote/post/${postId}`, voteType, isAdding);
    }
}
