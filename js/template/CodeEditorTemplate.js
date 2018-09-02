import CodeEditorViewController from '~/controllers/CodeEditorViewController';
import Template from '~/template/Template';

/**
 * The code editor
 * @implements {InputInterface}
 */
export default class CodeEditorTemplate extends Template {
    /**
     * Takes no parameters, adjust using the controller
     */
    constructor() {
        const container = <DocumentFragment/>;
        super(container);

        /** @type {CodeEditorViewController} */
        this.controller = null;

        return (async () => {
            this.controller = await new CodeEditorViewController(container);

            return this;
        })();
    }

    /** @override */
    didLoad() {
        super.didLoad();
        this.controller._editor.refresh();
    }

    // MARK: - InputInterface
    /** @override */
    observeValue() {
        return this.controller.observeValue();
    }

    /** @override */
    get userInput() { return null; }
}
