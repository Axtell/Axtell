import Template from '~/template/Template';
import NavigationItemDelegate from '~/delegate/NavigationItemDelegate';

const ACTIVE_CLASS = 'write-post__subheader__list__step--active';
export default class WritePostNavigationItemTemplate extends Template {
    constructor(title, description, id) {
        const root = (
            <li class="write-post__subheader__list__step"></li>
        );

        super(root);

        root.appendChild(
            <DocumentFragment>
                <span class="write-post__subheader__list__step__number">{ this.defineLinkedText('index', '0') }</span>
                <div class="write-post__subheader__list__step__stack">
                    <h2>{ title }</h2>
                    <h3>{ description }</h3>
                </div>
            </DocumentFragment>
        );

        /** @type {number} */
        this.index;

        /** @type {symbol} */
        this.id = id;

        this._root = root;

        /** @type {NavigationItemDelegate} */
        this.delegate = new NavigationItemDelegate();

        this._root.addEventListener("click", () => {
            this.delegate.shouldOpen(this, id);
        });
    }

    /** @type {boolean} */
    set isActive(isActive) {
        if (isActive) {
            this._root.classList.add(ACTIVE_CLASS);
        } else {
            this._root.classList.remove(ACTIVE_CLASS);
        }
    }

    /** @type {boolean} */
    get isActive() {
        this._root.classList.has(ACTIVE_CLASS);
    }
}
