import Template from '~/template/Template';
import NavigationItemDelegate from '~/delegate/NavigationItemDelegate';

export default class WritePostSubheaderTemplate extends Template {
    /**
     * Creates
     */
    constructor() {
        const list = <ol class="write-post__subheader__list content"></ol>;
        const root = (
            <div class="write-post__subheader__wrapper">
                { list }
            </div>
        );

        super(root);

        /** @type {NavigationItemDelegate} */
        this.delegate = new NavigationItemDelegate();

        this._list = list;
        this._tabs = [];
        this._activeTab = -1;
    }

    /** @type {number} */
    get activeTab() { return this._activeTab; }

    /** @type {number} */
    set activeTab(index) {
        const oldTab = this._tabs[this._activeTab];
        if (oldTab) {
            oldTab.isActive = false;
        }

        this._activeTab = index;
        this._tabs[this._activeTab].isActive = true;
    }

    /** @override */
    didLoad() {
        if (this.activeTab !== -1) {
            this.delegate.shouldOpen(this, this._tabs[this.activeTab].id);
        }
    }

    /**
     * @param {WrietPostNavigationItemTemplate} item
     * @param {boolean} isActive - if is active
     */
    appendNavigationItem(item, isActive = false) {
        this._tabs.push(item);

        if (isActive) {
            this.activeTab = this._tabs.length - 1;
        } else if (this.activeTab === -1) {
            this.activeTab = this._tabs.length - 1;
        }

        item.index = this._tabs.length;
        item.loadInContext(this._list);

        item.delegate.shouldOpen = (template, id) => {
            this.delegate.shouldOpen(this, id);
        };
    }
}
