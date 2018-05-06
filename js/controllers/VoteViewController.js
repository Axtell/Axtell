import ViewController from '~/controllers/ViewController';
import ErrorManager from '~/helpers/ErrorManager';
import Theme from '~/models/Theme';
import Auth from '~/models/Auth';

import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ModalController from '~/controllers/ModalController';

import LoadingIcon from '~/svg/LoadingIcon';

export const VOTE_ACTIVE_CLASS = 'selected';
export const VoteFailed = Symbol('Vote.Error.RequestFailed');
export const VoteUnauthorized = Symbol('Vote.Error.VoteUnauthorized');
export const VoteInvalid = Symbol('Vote.Error.VoteInvalid');

/**
 * Controls voting
 * @abstract
 */
export default class VoteViewController extends ViewController {
    /**
     * @param {HTMLElement} voteButton
     * @property {string} voteType
     */
    constructor(voteButton, voteType) {
        super();

        voteButton.controller = this;

        this._voteType = voteType;
        this._voteTotal = voteButton.getElementsByClassName('vote-count')[0];

        this._voteIcon = voteButton.getElementsByTagName('svg')[0];
        this._loadingIcon = LoadingIcon.cloneNode(true);
        this._iconParent = this._voteIcon.parentNode;

        this._isLoading = false;

        this._root = voteButton;
        this._isActive = voteButton.classList.contains(VOTE_ACTIVE_CLASS);

        // Ignore if not a valid vote button
        if (voteButton.classList.contains('disabled')) return this;
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
     * Returns a vote request for the data
     * @param {string} voteType
     * @param {boolean} status
     * @return {Request}
     * @abstract
     */
    getRequest(voteType, status) { return null; }

    /**
     * What to set vote too.
     * @param {boolean} status
     */
    async setVote(status) {
        let voteRequest = this.getRequest(this._voteType, status);

        try {
            this.setLoading(true);

            // Check if logged in at all
            let auth = await Auth.shared;

            if (await auth.isAuthorized) {
                let response = await voteRequest.send();

                this.setVoteTotal(response.total);
                this.setVoteActivity(response.voted);
            } else {
                ModalController.shared.present(AuthModalTemplate.shared);
            }
        } catch(error) {
            switch (error.response && error.response.status) {
                case 401:
                    ErrorManager.raise(`You must be authorized to vote.`, VoteUnauthorized);
                    break;
                case 403:
                    ErrorManager.raise(`You cannot vote on your own post.`, VoteInvalid);
                case 500:
                    ErrorManager.raise(`Server error during vote.`, VoteFailed);
                    break;
                default:
                    ErrorManager.silent(error, `Unexpected error while voting.`);
            }
        } finally {
            this.setLoading(false);
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
        // Don't toggle if loading
        if (this._isLoading) return;

        this.setVote(!this._isActive).catch(::ErrorManager.report);
    }
}
