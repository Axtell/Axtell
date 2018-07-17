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
     * @param {MarkdownControl[]} controls
     */
    constructor(element, controls = [
                new MarkdownControls.MarkdownBoldControl(),
                new MarkdownControls.MarkdownItalicControl(),
                new MarkdownControls.MarkdownStrikethroughControl(),
                new MarkdownControls.MarkdownLinkControl(),
                new MarkdownControls.MarkdownImgurControl(),
                new MarkdownControls.MarkdownMathControl()
        ]) {
        super(element);

        /** @private */
        this.elem = element;

        let controlTemplate = new MarkdownControlsTemplate(this.elem, controls);
        controlTemplate.loadBeforeContext(this.elem);

        this._controls = controlTemplate;
    }
}
