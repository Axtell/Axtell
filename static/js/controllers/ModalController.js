import ViewController from '~/controllers/ViewController';

const ACTIVE_KEY = "md-active";

/**
 * Manages a modal in a webpage. Use `ModalContext.shared` to get the global
 * context.
 *
 * @extends {ViewController}
 */
export default class ModalController extends ViewController {
    constructor() {
        super();

        this._context = null;
        this._body = null;
        this._title = null;
        this._presenting = null;
    }

    /**
     * Presents a modal dialog
     * @param {ModalTemplate} modal Modal dialog to present
     * @return {boolean} `true` if presented
     */
    present(modal) {
        if (this._context === null) this._createContext();
        if (this._presenting) return false;

        this._setPresentee(modal);

        return true;
    }

    /**
     * Closes the modal if open
     */
    dismiss() {
        this._clearPresentee(null);
    }

    _setPresentee(modal) {
        this._context.classList.add(ACTIVE_KEY);

        let body = modal.unique();

        modal.willLoad();
        this._body.appendChild(body);
        this._title.appendChild(
            document.createTextNode(modal.getTitle())
        );

        modal.didLoad();
        this._presenting = body;
    }

    _clearPresentee(event) {
        if (this._presenting === null) return;
        if (event && !event.target.classList.contains('md-dismiss')) return;

        this._context.classList.remove(ACTIVE_KEY);
        this._body.removeChild(this._presenting);
        this._title.removeChild(this._title.firstChild);
        this._presenting = null;
    }

    _createContext() {
        let context = document.createElement("div");
        context.id = "md-context";
        context.className = "md-dismiss";
        context.addEventListener("click", ::this._clearPresentee);
        this._context = context;

        let body = document.createElement("div");
        body.className = "md-body";

        // Head
        let head = document.createElement("div");
        head.className = "md-head";

        let exit = document.createElement("a");
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

ModalController.shared = new ModalController();
