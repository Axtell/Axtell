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
     * @param {TemplateType} [type=none] - Type of the template to reference.
     */
    constructor(root, type = TemplateType.none) {
        if (root instanceof Template) {
            this._root = root._root;
            this._type = root._type;
        } else if (typeof root === 'string') {
            this._root = document.getElementById(root);
            this._type = type;
        } else {
            this._root = root;
            this._type = type;
        }

        this._root.template = this;

        this._parent = this._root.parentNode;

        this._hasLoaded = false;
    }

    /**
     * Returns the underlying element
     * @type {HTMLElement}
     */
    get underlyingNode() {
        return this._root;
    }

    /**
     * An empty template
     */
    static get empty() {
        return new Template(
            <div></div>,
            TemplateType.clone
        );
    }

    /**
     * Performs a `move` {@link TemplateType} for a given HTML id to return a
     * template based on the id's root.
     * @param {string} id HTML ID of a {@link HTMLElement}
     * @param {TemplateType} type Type of the template
     * @return {Template} New template.
     */
    static fromId(id, type = TemplateType.none) {
        return new Template(
            document.getElementById(id),
            type
        );
    }

    /**
     * Creates template `<div>` with text.
     * @param {string} text - text of new elem
     * @param {TemplateType} [type=none] - Type of the generated template.
     * @return {Template} new template.
     */
    static fromText(text, type) {
        let elem = document.createElement('div');
        elem.appendChild(document.createTextNode(text));
        return new Template(elem, type);
    }

    /**
     * From innerHTML will wrap in div
     * @param {HTMLElement} wrapper
     * @param {string} innerHTML the innerHTML
     * @param {TemplateType} [type=none]
     * @return {Template}
     */
    static fromInnerHTML(wrapper, innerHTML, type) {
        wrapper.innerHTML = innerHTML;
        return new Template(wrapper, type);
    }

    /**
     * Returns a unique instance of the template as an HTMLElement.
     * @return {HTMLElement} unique instance of the DOM element.
     */
    unique() {
        switch (this._type) {
            case TemplateType.move:
                this._root.parentNode.removeChild(this._root);
                this._root.classList.remove('template');
                this._type = TemplateType.none;
                return this._root;
            case TemplateType.clone:
                return this._root.cloneNode(true);
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
    didLoad() {
        void 0;
    }

    /**
     * Called right before the view will appear on screen
     */
    willLoad() {
        this._hasLoaded = true;
        void 0;
    }

    /**
     * Called before disappearing
     */
    willUnload() { void 0; }

    /**
     * Called when disappeared
     */
    didUnload() { void 0; }

    /**
     * Loads the template in a context
     * @param {HTMLElement} parent - Will be appended to this node.
     * @param {boolean} allowDupliacte If should allow to be loaded multiple times
     * @return {HTMLElement} rendered element
     */
    loadInContext(parent, allowDuplicate = true) {
        if (!allowDuplicate && this._hasLoaded) return;

        let elem = this.unique();
        this.willLoad();
        parent.appendChild(elem);
        this.didLoad();
        return elem;
    }

    /**
     * Creates a field w/ updating text
     * @param {string} name The field name
     * @param {string} defaultValue The default value
     * @return {Text}
     */
    defineLinkedText(name, defaultValue) {
        let node = document.createTextNode(defaultValue);

        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            get: () => node.data,
            set: (newValue) => { node.data = newValue }
        });

        return node;
    }

    /**
     * Defines a linked input
     * @param {string} name the name
     * @param {HTMLElement} [input=underlyingNode]
     */
    defineLinkedInput(name, input = this.underlyingNode) {
        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            get: () => input.value,
            set: (newValue) => { input.value = newValue }
        });

        return input;
    }

    /**
     * Defines a linked attribute
     * @param {string} name the name
     * @param {HTMLElement} [input=underlyingNode]
     */
    defineLinkedAttribute(name, node = this.underlyingNode) {
        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            get: () => input.getAttribute(name),
            set: (newValue) => { input.setAttribute(name, newValue) }
        });

        return input;
    }

    /**
     * Defines a linked class
     * @param {string} name - field name
     * @param {string} className
     * @param {HTMLElement} [node=underlyingNode]
     */
    defineLinkedClass(name, className, node = this.underlyingNode) {
        const isInv = className.indexOf('!') === 0;
        const realClassName = isInv ? className.substring(1) : className;
        Object.defineProperty(this, name, {
            configurable: true,
            enumerable: true,
            get: () => node.classList.contains(realClassName),
            set: (newValue) => {
                if (newValue ^ isInv) node.classList.add(realClassName);
                else node.classList.remove(realClassName);
            }
        });
    }

    /**
     * Loads and replaces
     * @param {HTMLElement} source - what to replace
     * @return {HTMLElement}
     */
    loadReplacingContext(source) {
        const elem = this.unique();
        this.willLoad();
        source.parentNode.replaceChild(elem, source);
        this.didLoad();
        return elem;
    }

    /**
     * Loads before an element
     * @param {HTMLElement} elem - Element to load before
     * @return {HTMLElement} rendered element
     */
    loadBeforeContext(elem) {
        let instance = this.unique();
        this.willLoad();
        elem.parentNode.insertBefore(instance, elem);
        this.didLoad();
        return instance;
    }
}

/**
 * @typedef {Object} TemplateType type of template.
 */
export const TemplateType = {
    move: 0,
    clone: 1,
    none: 2
};
