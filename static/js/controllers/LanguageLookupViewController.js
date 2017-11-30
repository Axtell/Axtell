import ViewController from '~/controllers/ViewController';
import ErrorManager from '~/helper/ErrorManager';

import Normalize from '~/models/Normalize';
import Language from '~/models/Language';

import LanguageListTemplate from '~/template/LanguageListTemplate';
import LanguageTemplate from '~/template/LanguageTemplate';

export const NoInputBox = Symbol('LanguageLookup.NoInput');

/**
 * Provides a language search box
 * @implements {ActionControllerDelegate}
 */
export default class LanguageLookupViewController extends ViewController {
    /**
     * Creates a box with format:
     *
     *      div
     *          input
     *
     * Where absolute `div::after` elements of `top: 100%` would fit.
     *
     * @param {HTMLElement} box - HTML element container of box. Creates a
     *                          canonical controller ref here.
     */
    constructor(box) {
        super();

        // VC root
        this._container = box;

        // The input typing box
        this._input = box.getElementsByTagName("input")[0];
        if (!this._input) {
            ErrorManager.raise(`Could not find input for lookup`, NoInputBox);
        }

        // Register update request
        this._input.addEventListener("input", ::this.didInvalidateState);

        // Create managing language list.
        this._list = new LanguageListTemplate();
        this._list.loadInContext(this._container);
    }

    /**
     * Called when this should update
     * @param {Event} event
     */
    didInvalidateState(event) {
        this._list.clearList();
        let results = Language.query.normalizedFind(this._input.value, 5, 0);

        results.forEach(result => {
            this._list.appendLanguage(result.value);
        })
    }
}
