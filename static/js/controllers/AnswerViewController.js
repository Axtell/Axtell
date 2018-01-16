import ViewController from '~/controllers/ViewController';
import AnswerVoteViewController from '~/controllers/AnswerVoteViewController';

/**
 * Manages an answer of a given id.
 */
export default class AnswerViewController extends ViewController {
    /**
     * @param {HTMLElement} answer
     * @param {number} answerId
     */
    constructor(answer, answerId) {
        super();

        answer.controller = this;

        this._body = answer;
        this._answerId = answerId;

        AnswerVoteViewController.forClass(
            'vote-button',
            (btn) => [btn, {
                voteType: btn.dataset.type,
                answerId: answerId
            }],
            answer
        )
    }
}
