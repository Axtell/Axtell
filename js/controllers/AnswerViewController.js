import ViewController from '~/controllers/ViewController';
import AnswerVoteViewController from '~/controllers/AnswerVoteViewController';
import CommentListViewController from '~/controllers/CommentListViewController';
import DeleteItemViewController from '~/controllers/DeleteItemViewController';
import EditAnswerViewController from '~/controllers/EditAnswerViewController';

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
        this._answer.code = this._body.getElementsByTagName('code')[0].textContent;

        AnswerVoteViewController.forClass(
            'vote-button',
            (btn) => [btn, {
                voteType: btn.dataset.type,
                answerId: answerId
            }],
            answer
        );

        DeleteItemViewController.forClass(
            'delete-button',
            (btn) => [{
                trigger: btn,
                item: this._answer
            }],
            answer
        );

        EditAnswerViewController.forClass(
            'golf-button',
            (btn) => [{
                trigger: btn,
                answerController: this
            }],
            answer
        );

        const answerComments = new CommentListViewController(
            answer.querySelector('.comment-list'),
            this.answer
        );
        answerComments.setupSublists();
    }

    /**
     * Gets the node where the body is
     * @return {HTMLElement}
     */
    getBody() {
        return this._body.getElementsByClassName('body')[0];
    }

    /** @type {Answer} */
    get answer() { return this._answer; }
}
