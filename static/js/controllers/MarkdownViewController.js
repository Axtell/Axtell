import ViewController from '~/controllers/ViewController';
import MarkdownControlsTemplate from '~/template/MarkdownControlsTemplate';
import * as MarkdownControls from '~/controllers/MarkdownControls';
import ErrorManager from '~/helpers/ErrorManager';

/**
 * Manages markdown editor
 */
export default class MarkdownViewController extends ViewController {
    /**
     * Creates an interactive markdown editor instance.
     *
     * @param {HTMLTextArea} element .markdown element which to setup.
     */
    constructor(element) {
        super(element);

        /** @private */
        this.elem = element;

        let controls = new MarkdownControlsTemplate(
            this.elem,
            [
                MarkdownControls.MarkdownBoldControl,
                MarkdownControls.MarkdownItalicControl,
                MarkdownControls.MarkdownImgurControl
            ]
        );
        controls.loadBeforeContext(this.elem);

        this._controls = controls;
    }
}
