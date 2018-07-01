import ViewController from '~/controllers/ViewController';

/**
 * Allows swapping between two views
 */
export default class SwappingViewController extends ViewController {
    /**
     * @param {HTMLElement} source The original HTML element
     */
    constructor(source) {
        super(source);

        this._parent = source.parentNode;
        this._source = source;
        this._replacee = null;
        this._displayingSource = true;
    }

    /**
     * Shows the original view
     */
    restoreOriginal() {
        if (this._displayingSource) return;
        this._parent.replaceChild(this._source, this._replacee)
        this._displayingSource = true;
        this._replacee = null;
    }

    /**
     * Swaps to an alternate view
     * @param {Template} alternate - New elem to show
     */
    displayAlternate(alternate) {
        const node = alternate.loadReplacingContext(
            this._displayingSource ? this._source : this._replacee
        );

        this._replacee = node;
        this._displayingSource = false;
    }
}
