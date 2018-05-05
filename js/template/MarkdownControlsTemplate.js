import Template, { TemplateType } from '~/template/Template';
import LanguageTemplate from '~/template/LanguageTemplate';
import KeyManager from '~/models/KeyManager';

/**
 * Template for a markdown control list. Default with no actions.
 */
export default class MarkdownControlsTemplate extends Template {
    /**
     * Creates a markdown control list.
     *
     * @param {HTMLTextArea} source - where md is being edited.
     * @param {MarkdownControl[]} [controls=[]] - List of control templates.
     */
    constructor(source, controls = []) {
        let controlList = <ul></ul>;
        let root = <div class="markdown-controller">{controlList}</div>;

        super(root);

        this._root = root;
        this._list = controlList;
        this._source = source;

        this._keyTriggers = new Map();

        /** @private */
        this.keyManager = new KeyManager(this._source);

        this.addControls(controls);
    }

    /**
     * Adds controls
     * @param {MarkdownControl[]} controls
     */
    addControls(controls) {
        for (let i = 0; i < controls.length; i++) {
            this.addControl(controls[i]);
        }
    }

    /**
     * Adds a control
     */
    addControl(control) {
        if (control._keyName !== null) {
            this.keyManager.registerMeta(control._keyName, () => control.trigger());
        }

        control.setControllingTemplate(this);
        this._list.appendChild(<li>{control.unique()}</li>);
    }

    /**
     * Inserts at a the beginning of where the user is.
     * @param {string} string
     */
    insertAtSelectionStart(string) {
        let { selectionStart: start, selectionEnd: end, value } = this._source;
        let newString = value.substring(0, start) + string + value.substring(start);
        this._source.value = newString;
        this._source.setSelectionRange(start + string.length, end + string.length);
    }

    /**
     * Inserts at a the end of where the user is.
     * @param {string} string
     */
    insertAtSelectionEnd(string) {
        let { selectionStart: start, selectionEnd: end, value } = this._source;
        let newString = value.substring(0, end) + string + value.substring(end);
        this._source.value = newString;
        this._source.setSelectionRange(start, end);
    }

    /**
     * Checks if a string leads the selection
     * @param {string} string
     * @return {boolean}
     */
    isLeading(string) {
        let { selectionStart: start, value } = this._source;
        return value.substring(start - string.length, start) === string;
    }

    /**
     * Checks if a string trails the selection
     * @param {string} string
     * @return {boolean}
     */
    isTrailing(string) {
        let { selectionEnd: end, value } = this._source;
        return value.substring(end, end + string.length) === string;
    }

    /**
     * Cuts from beginning of selection
     * @param {number} count positive, non-zero integer of a size to cut
     */
    cutStart(count) {
        let { selectionStart: start, selectionEnd: end, value } = this._source;
        this._source.value = value.substring(0, start - count) + value.substring(start);
        this._source.setSelectionRange(start - count, end - count);
    }

    /**
     * Cuts from the end of selection
     * @param {number} count positive, non-zero integer of a size to cut
     */
    cutEnd(count) {
        let { selectionStart: start, selectionEnd: end, value } = this._source;
        this._source.value = value.substring(0, end) + value.substring(end + count);
        this._source.setSelectionRange(start, end);
    }

    /**
     * Value of the selection
     * @type {string}
     */
    get selection() {
        return this._source.value.substring(
            this._source.selectionStart,
            this._source.selectionEnd
        );
    }
}
