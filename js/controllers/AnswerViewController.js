import ViewController from '~/controllers/ViewController';
import AnswerVoteViewController from '~/controllers/AnswerVoteViewController';
import CommentListViewController from '~/controllers/CommentListViewController';

import Data from '~/models/Data';
import Answer from '~/models/Answer';

/**
 * Manages an answer of a given id.
 */
export default class AnswerViewController extends ViewController {
    /**
     * @param {HTMLElement} answer
     * @param {number} answerId
     */
    constructor(answer, answerId) {
        super(answer);

        this._body = answer;
        this._answerId = answerId;

        this._answer = Answer.fromJSON(Data.shared.encodedJSONForKey(`a${answerId}`));

        AnswerVoteViewController.forClass(
            'vote-button',
            (btn) => [btn, {
                voteType: btn.dataset.type,
                answerId: answerId
            }],
            answer
        );

        CommentListViewController.forClass(
            'comment-list',
            (commentList) => [commentList, this.answer],
            answer
        );
    }

    /** @type {Answer} */
    get answer() { return this._answer; }
}
