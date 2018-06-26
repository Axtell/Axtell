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

        this._bodyEl = this._body.getElementsByClassName('body')[0];
        this._byteCount = this._body.getElementsByClassName('answer-metric__value')[0];

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
     * @type {HTMLElement}
     */
    get body() {
        return this._bodyEl;
    }

    /**
     * Sets the code
     * @param {string} code
     * @param {Language} language
     */
    async setBody(code, language) {
        const { default: highlight } = await import('#/hljs-renderer');
        this.body.innerHTML = highlight(code, language.hljsId, language.id);
    }


    /**
     * Returns the byte count element. For the value use .answer.length
     * @type {HTMLElement}
     */
    get byteCount() {
        return this._byteCount;
    }

    /**
     * Sets the byte count.
     * @type {number}
     */
    set byteCount(byteCount) {
        const byteCountElement = this.byteCount;
        while (byteCountElement.firstChild) {
            byteCountElement.removeChild(byteCountElement.firstChild);
        }
        byteCountElement.appendChild(document.createTextNode(byteCount+""));
    }

    /** @type {Answer} */
    get answer() { return this._answer; }

    /**
     * Sets the answer
     * @param {Answer} newAnswer
     */
    async setAnswer(newAnswer) {
        this._answer = newAnswer;
        await this.setBody(newAnswer.code, newAnswer.language);
        this.byteCount = newAnswer.length;
    }
}
