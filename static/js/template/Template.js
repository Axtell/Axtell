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
        if (root instanceof Template) {
            this._root = root._root;
            this._type = root._type;
        } else {
            this._root = root;
            this._type = type;
        }
        
        this._parent = this._root.parentNode;
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
                this._type = TemplateType.none;
                return this._root;
            case TemplateType.clone:
                return this._root.cloneNode();
            default:
                return this._root;
        }
    }
    
    /**
     * Gets the original parent or else a default
     * @param {?HTMLElement} defaultElement
     * @return {HTMLElement} parent element or the `defualt` provided.
     */
    getParent(defaultElement) {
        return this._parent || defaultElement;
    }
    
    /**
     * Called when the view has loaded
     */
    didLoad() { void 0; }
    
    /**
     * Called right before the view will appear on screen
     */
    willLoad() { void 0; }
    
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
export const TemplateType = {
    move: 0,
    clone: 1,
    none: 2
}
