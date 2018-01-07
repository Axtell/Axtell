import ViewController from '~/controllers/ViewController';
import AnswerVote from '~/models/Request/AnswerVote';
import Theme from '~/models/Theme';
import ErrorManager from '~/helper/ErrorManager';

export const VOTE_ACTIVE_CLASS = 'selected';
export const VoteFailed = Symbol('AnswerVote.Error.RequestFailed');

/**
 * Controls voting
 */
export default class VoteViewController extends ViewController {
    /**
     * @param {HTMLElement} voteButton
     * @param {Object} opts
     * @property {string} opts.voteType
     * @property {number} opts.answerId
     */
    constructor(voteButton, { voteType, answerId }) {
        super();

        voteButton.controller = this;

        this._answerId = answerId;
        this._voteType = voteType;

        this._voteTotal = voteButton.getElementsByClassName('vote-count')[0];

        this._voteIcon = voteButton.getElementsByTagName('svg')[0];
        this._loadingIcon = <img src={Theme.current.imageForTheme('loading')} />;
        this._iconParent = this._voteIcon.parentNode;

        this._isLoading = false;

        this._root = voteButton;
        this._isActive = voteButton.classList.contains(VOTE_ACTIVE_CLASS);

        voteButton.addEventListener("click", ::this.toggleState);
    }

    /**
     * Sets the loading state
     * @param {boolean} state
     */
    setLoading(state) {
        // Check if desired state matches existing (to ensure always transition)
        if (state === this._isLoading) return;
        if (state) {
            this._iconParent.replaceChild(this._loadingIcon, this._voteIcon);
        } else {
            this._iconParent.replaceChild(this._voteIcon, this._loadingIcon);
        }

        this._isLoading = state;
    }

    /**
     * Sets the vote total
     * @param {number} value - total number amount of votes
     */
    setVoteTotal(value) {
        while (this._voteTotal.lastChild) {
            this._voteTotal.removeChild(this._voteTotal.lastChild);
        }

        this._voteTotal.appendChild(document.createTextNode(value));
    }

    /**
     * What to set vote too.
     * @param {boolean} status
     */
    async setVote(status) {
        let voteRequest = new AnswerVote({
            answerId: this._answerId,
            voteType: this._voteType,
            isAdding: status
        });

        try {
            this.setLoading(true);
            let response = await voteRequest.get();
            this.setLoading(false);

            this.setVoteTotal(response.total);
            this.setVoteActivity(response.voted);
        } catch(error) {
            ErrorManager.silent(error, `Unexpected error while voting.`);
        }
    }

    /**
     * Sets vote activity
     * @param {boolean} activity - vote activity
     */
    setVoteActivity(activity) {
        this._isActive = activity;
        if (activity) {
            this._root.classList.add(VOTE_ACTIVE_CLASS);
        } else {
            this._root.classList.remove(VOTE_ACTIVE_CLASS);
        }
    }

    /**
     * Toggles vote controller value.
     */
    toggleState() {
        this.setVote(!this._isActive);
    }
}
