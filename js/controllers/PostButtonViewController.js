import ViewController from '~/controllers/ViewController';
import LoadingIcon from '~/svg/LoadingIcon';

/**
 * Controls loading sign etc. for an action button on a post
 */
export default class PostButtonViewController extends ViewController {
    /**
     * Creates for a button
     * @param {HTMLElement} button
     */
    constructor(button) {
        super(button);

        this._button = button;
        this._voteIcon = button.getElementsByTagName('svg')[0];
        this._loadingIcon = LoadingIcon.cloneNode(true);
        this._iconParent = this._voteIcon.parentNode;

        this._isLoading = false;
        this._isDisabled = false;
    }

    /**
     * Sets the loading state
     * @type {boolean}
     */
    set isLoading(state) {
        // Check if desired state matches existing (to ensure always transition)
        if (state === this._isLoading) return;
        if (state) {
            // Is loading
            this.isDisabled = true;
            this._iconParent.replaceChild(this._loadingIcon, this._voteIcon);
        } else {
            this.isDisabled = false;
            this._iconParent.replaceChild(this._voteIcon, this._loadingIcon);
        }

        this._isLoading = state;
    }

    /** @type {boolean} */
    get isLoading() { return this._isLoading; }

    /**
     * Sets the loading state
     * @type {boolean}
     */
    set isDisabled(state) {
        if (state === this._isDisabled) return;
        if (state) {
            this._button.classList.add('action-button--disabled');
        } else {
            this._button.classList.remove('action-button--disabled');
        }

        this._isDisabled = state;
    }

    /** @type {boolean} */
    get isDisabled() { return this._isDisabled; }
}
