import Template from '~/template/Template';

/**
 * A presentable modal view.
 *
 * @abstract
 * @extends {Template}
 */
export default class ModalTemplate extends Template {
    _instance = null;

    /**
     * Creates a modal given a reference element. Use `Modal.shared` with a
     * subclass to get a canolical reference
     *
     * @param {string} title - title of modal
     * @param {HTMLElement} root - Root view of the template
     * @param {TemplateType} type - Type of the template to reference.
     */
    constructor(title, root, type) {
        super(root, type);

        this._title = title;
        this._subtitle = null;
    }

    /**
     * Obtains subtitle or nil
     * @type {?string}
     */
    get subtitle() { return this._subtitle; }

    /**
     * Sets the subtitle (note: may not update until re-created)
     * @type {string}
     */
    set subtitle(newSubtitle) { this._subtitle = newSubtitle; }

    /**
     * Returns shared instance, only applicable for subclasses
     * @type {Modal}
     */
    static get shared() {
        return this._instance || (this._instance = new this());
    }

    /**
     * Returns the modal title
     * @type {string}
     */
    get title() { return this._title; }
}
