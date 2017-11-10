const ACTIVE_KEY = "md-active";

/**
 * Manages a modal in a webpage. Use `ModalContext.shared` to get the global
 * context.
 */
class ModalContext {
    constructor() {
        this._context = null;
        this._body = null;
        this._title = null;
        this._presenting = null;
    }
    
    /**
     * Presents a modal dialog
     * @param {Modal} modal Modal dialog to present
     * @return {boolean} `true` if presented
     */
    present(modal) {
        if (this._context === null) this._createContext();
        if (this._presenting) return false;
        
        this._setPresentee(modal);
        
        return true;
    }
    
    _setPresentee(modal) {
        this._context.classList.add(ACTIVE_KEY);
        
        this._body.appendChild(modal._body);
        this._title.appendChild(
            document.createTextNode(modal._title)
        );
        
        this._presenting = modal;
    }
    
    _clearPresentee(event) {
        if (this._presenting === null) return;
        if (event && !event.target.classList.contains('md-dismiss')) return;
        
        this._context.classList.remove(ACTIVE_KEY);
        this._body.removeChild(this._presenting._body);
        this._title.removeChild(this._title.firstChild);
        this._presenting = null;
    }
    
    _createContext() {
        let context = document.createElement("div")
        context.id = "md-context";
        context.className = "md-dismiss";
        context.addEventListener("click", ::this._clearPresentee);
        this._context = context;
        
        let body = document.createElement("div");
        body.className = "md-body";
        
        // Head
        let head = document.createElement("div");
        head.className = "md-head";
        
        let exit = document.createElement("a")
        exit.href = "#";
        exit.className = "md-exit md-dismiss";
        exit.appendChild(document.createTextNode("x"));
        exit.addEventListener("click", ::this._clearPresentee());
        
        head.appendChild(exit);
        
        // Content
        let content = document.createElement("div");
        content.className = "md-content";
        this._body = content;
        
        let title = document.createElement("h3");
        this._title = title;
        
        content.appendChild(title);
        
        // Add all things together
        body.appendChild(content);
        body.appendChild(head);
        
        this._context.appendChild(body);
        document.body.appendChild(context);
    }
}

/**
 * A presentable modal.
 */
class Modal {
    /**
     * Creates a modal given a reference element. Use `Modal.shared` with a
     * subclass to get a canolical reference
     *
     * @param {string} title - title of modal
     * @param {HTMLElement} main - main body element of the modal
     * @param {ModalType} behavior - What should be done with the main
     */
    constructor(title, main, behavior = ModalType.clone) {
        this._title = title;
        switch(behavior) {
            case ModalType.move:
                main.parentNode.removeChild(main);
                main.classList.remove('md-template')
                this._body = main;
                break;
            case ModalType.clone:
                this._body = main.cloneNode();
                break;
            default:
                this._body = main;
        }
    }
    
    _instance = null;
    /**
     * Returns shared instance, only applicable for subclasses
     * @type {Modal}
     */
    static get shared() {
        return this._instance || (this._instance = new this());
    }
}

const ModalType = {
    move: 0,
    clone: 1,
    none: 2
}

ModalContext.shared = new ModalContext();

export { ModalContext, Modal, ModalType };
