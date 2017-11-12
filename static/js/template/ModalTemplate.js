import Template from '~/template/Template';

/**
 * A presentable modal view.
 *
 * @abstract
 * @extends {Template}
 */
export default class ModalTemplate extends Template {
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
    }
    
    /**
     * Returns the modal title
     * @return {string} the modal title.
     */
    getTitle() { return this._title; }
    
    _instance = null;
    
    /**
     * Returns shared instance, only applicable for subclasses
     * @type {Modal}
     */
    static get shared() {
        return this._instance || (this._instance = new this());
    }
}
