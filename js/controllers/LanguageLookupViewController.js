import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

import ViewController from '~/controllers/ViewController';
import ErrorManager from '~/helpers/ErrorManager';

import Normalize from '~/models/Normalize';
import Language from '~/models/Language';

import LanguageListTemplate from '~/template/LanguageListTemplate';
import { LanguageFixedTemplate } from '~/template/LanguageTemplate';

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

        this._activeLanguage = null;

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();
    }

    setLanguage(language) {
        this._input.value = "";
        this._list.clearList();

        let template = new LanguageFixedTemplate(language);
        template.onDismiss(() => {
            this.removeLanguage();
        });
        this._activeLanguage = template.loadInContext(this._container);

        this.delegate.didSetStateTo(this, language);
    }

    removeLanguage() {
        if (this._activeLanguage !== null) {
            this._activeLanguage.parentNode.removeChild(this._activeLanguage);
            this.delegate.didSetStateTo(this, null);
        }
    }

    /**
     * Called when this should update
     * @param {Event} event
     */
    didInvalidateState(event) {
        this._list.clearList();
        let results = Language.query.find(this._input.value, 5);

        results.forEach(lang => {
            let langBox = this._list.appendLanguage(lang)
            langBox.addEventListener("click", () => {
                this.setLanguage(lang);
            });
        })
    }
}
