/**
 * Manages a section of HTML used with a view. See {@link TemplateType} to see
 * how you can import one
 */
export default class Template {
    /**
     * Creates a template from some form of HTML fragment. This can be from the
     * DOM or a JS-based HTMLElement
     *
     * @param {HTMLElement} root - Root view of the template
     * @param {TemplateType} type - Type of the template to reference.
     */
    constructor(root, type) {
        this._root = root;
        this._type = type;
    }
    
    /**
     * Returns a unique instance of the template as an HTMLElement.
     * @return {HTMLElement} unique instance of the DOM element.
     */
    unique() {
        switch(this._type) {
            case TemplateType.move:
                this._root.parentNode.removeChild(this._root);
                this._root.classList.remove('template')
                this._type = TemplateType.clone;
                return this._root;
            case TemplateType.clone:
                return this._root.cloneNode();
            default:
                return this._root;
        }
    }
    
    /**
     * Performs a `move` {@link TemplateType} for a given HTML id to return a
     * template based on the id's root.
     * @param  {string} id HTML ID of a {@link HTMLElement}
     * @return {Template} New template.
     */
    static fromId(id) {
        return new Template(
            document.getElementById(id),
            TemplateType.move
        );
    }
}

/**
 * @typedef {Object} TemplateType type of template.
 */
const TemplateType = {
    move: 0,
    clone: 1,
    none: 2
}
