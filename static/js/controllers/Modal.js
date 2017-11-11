import View from '~/controllers/View';

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
        
        modal.willLoad();
        this._body.appendChild(modal._body);
        this._title.appendChild(
            document.createTextNode(modal._title)
        );
        
        modal.didLoad();
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
        
        let embed = document.createElement("div");
        embed.className = "md-embed";
        this._body = embed;
        
        let title = document.createElement("h3");
        this._title = title;
        
        content.appendChild(title);
        content.appendChild(embed);
        
        // Add all things together
        body.appendChild(content);
        body.appendChild(head);
        
        this._context.appendChild(body);
        document.body.appendChild(context);
    }
}

/**
 * A presentable modal.
 *
 * @extends {View}
 */
class Modal extends View {
    /**
     * Creates a modal given a reference element. Use `Modal.shared` with a
     * subclass to get a canolical reference
     *
     * @param {string} title - title of modal
     * @param {Template} main - main tempalte of the modal itself
     */
    constructor(title, main) {
        super();
        
        this._title = title;
        this._body = main.unique();
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

ModalContext.shared = new ModalContext();

export { ModalContext, Modal };
