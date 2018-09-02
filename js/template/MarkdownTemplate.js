import MarkdownViewController from '~/controllers/MarkdownViewController';
import Template from '~/template/Template';

import { fromEvent } from 'rxjs';
import { map, share, startWith } from 'rxjs/operators';

const minHeight = 16 * 8; // line-height * lines
const reflowTargets = new Set();

window.addEventListener("resize", () => {
    for (const target of reflowTargets) {
        target.reflow();
    }
})

/**
 * Markdown editor
 * @implements {InputInterface}
 */
export default class MarkdownTemplate extends Template {
    /**
     * Markdown editor. Pass opts as an object
     * @param {?string} placeholder The placeholder
     * @param {?(MarkdownControl[])} controls - If provided use these controls
     * @param {boolean} [shadow=true] - If to show shadow
     * @param {boolean} [autoresize=false] - If to autoresize
     */
    constructor({ placeholder = "", controls, hasShadow = true, autoResize = false } = {}) {
        const textarea = <textarea placeholder={placeholder} class="markdown text-base"></textarea>;

        super(
            <div class="markdown-wrapper">{textarea}</div>
        );

        this._observeValue = fromEvent(textarea, 'input')
            .pipe(
                map(event => event.target.value),
                startWith(""),
                share());

        this.defineLinkedInput('value', textarea);
        this.defineLinkedClass('hasShadow', '!markdown-wrapper--shadow-none')
        /** @type {Boolean} */
        this.hasShadow = hasShadow;

        /** @type {MarkdownViewController} */
        this.controller = new MarkdownViewController(textarea, controls);

        this._autoresize = false;
        this._textarea = textarea;
        this._onInput = null;

        this.autoresize = autoResize;
    }

    // MARK: - InputInterface
    /** @override */
    observeValue() {
        return this._observeValue;
    }

    /** @override */
    get userInput() { return this._textarea }

    /** @type {boolean} */
    set autoresize(shouldAutoresize) {
        if (shouldAutoresize) {
            this._autoresize = true;
            this._onInput = () => { this.reflow() };
            this._textarea.addEventListener("input", this._onInput);
        } else {
            this._autoresize = false;
            if (this._onInput) {
                this._textarea.removeEventListener("input", this._onInput);
                this._onInput = null;
            }
        }
    }

    /** @override */
    didLoad() {
        this.reflow();
    }

    /**
     * Re-determines dimensions etc.
     */
    reflow() {
        if (this._autoresize) {
            this._textarea.style.height = "";
            this._textarea.style.height = `${Math.max(this._textarea.scrollHeight, minHeight)}px`;
        }
    }
}
