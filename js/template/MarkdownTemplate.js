import MarkdownViewController from '~/controllers/MarkdownViewController';
import Template from '~/template/Template';

/**
 * Markdown editor
 */
export default class MarkdownTemplate extends Template {
    /**
     * Markdown editor
     */
    constructor(title) {
        const textarea = <textarea class="markdown text-base"></textarea>;

        super(
            <div class="markdown-wrapper">{textarea}</div>
        );

        this.defineLinkedInput('value');

        /** @type {MarkdownViewController} */
        this.controller = new MarkdownViewController(textarea);
    }
}
