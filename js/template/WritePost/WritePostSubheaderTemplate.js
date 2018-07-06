import Template from '~/template/Template';
import NavigationItemDelegate from '~/delegate/NavigationItemDelegate';
import anime from 'animejs';

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
        if (index === this._activeTab) return;
        const curTab = this._tabs[index];
        if (!curTab) return;

        this.delegate.shouldOpen(this, curTab.id);

        const oldTab = this._tabs[this._activeTab];
        if (oldTab) {
            oldTab.isActive = false;
        }

        this._activeTab = index;
        curTab.isActive = true;

        // Check if we need to scroll to center the tab item
        //  for mobile because we scroll the step list
        if (this._list.scrollWidth > this._list.clientWidth) {
            const tabItem = curTab.underlyingNode;
            const animationTime = 100;

            // If the tabItem won't fit, then show as much as possible
            if (tabItem.offsetWidth > this._list.clientWidth) {
                anime({
                    targets: this._list,
                    scrollLeft: tabItem.offsetLeft,
                    duration: 200,
                });
            } else {
                // If it can fit then center
                let parentOffset = this._list.clientWidth / 2;
                let tabItemOffset = tabItem.offsetWidth / 2;
                anime({
                    targets: this._list,
                    scrollLeft: Math.max(tabItem.offsetLeft - parentOffset + tabItemOffset, 0),
                    duration: 600,
                    elasticity: 10
                });
            }
        }
    }

    /**
     * Goes to next tab if possible otherwise does nothing
     */
    nextTab() {
        this.activeTab += 1;
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

        item.delegate.shouldOpen = (item, id) => {
            this.activeTab = item.index - 1;
        };
    }
}
