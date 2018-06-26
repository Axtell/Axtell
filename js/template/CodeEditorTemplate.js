import CodeEditorViewController from '~/controllers/CodeEditorViewController';
import Template from '~/template/Template';

/**
 * The code editor
 */
export default class CodeEditorTemplate extends Template {
    /**
     * Takes no parameters, adjust using the controller
     */
    constructor() {
        const container = <DocumentFragment/>;
        super(container);

        return (async () => {
            /** @type {CodeEditorViewController} */
            this.controller = await new CodeEditorViewController(container);
            return this;
        })();
    }
}
