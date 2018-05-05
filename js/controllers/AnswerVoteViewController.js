import VoteViewController from '~/controllers/VoteViewController';
import AnswerVote from '~/models/Request/AnswerVote';

/**
 * Voting on answers
 */
export default class AnswerVoteViewController extends VoteViewController {

    /**
     * Creates an answer view controller
     * @param {HTMLElement} voteButton
     * @param {Object} opts
     * @property {string} opts.voteType
     * @property {number} opts.answerId
     */
    constructor(voteButton, { voteType, answerId }) {
        super(voteButton, voteType);
        this._answerId = answerId;
    }

    /** @override */
    getRequest(voteType, isAdding) {
        return new AnswerVote({
            answerId: this._answerId,
            voteType: voteType,
            isAdding: isAdding
        });
    }
}
