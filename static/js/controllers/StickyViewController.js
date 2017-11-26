import ViewController from '~/controllers/ViewController';

export const SCROLL_ELEMENT = 'content';

/**
 * @typedef {Object} ScrollProperty
 * @property {string} margin - Use for block elements
 * @property {string} absolute - Use for absolute positioned elements
 */
export const ScrollProperty = {
    margin: 'marginTop',
    absolute: 'top'
}

/**
 * Makes an element sticky relative to a given parent.
 */
export default class StickyViewController extends ViewController {
    static _global = null;
    static get global() {
        if (this._global !== null) return this._global;
        return this._global = document.getElementById(SCROLL_ELEMENT);
    }

    /**
     * Creates a StickyViewController which is based in a specific parent.
     * @param {HTMLElement} elem - Element to make sticky
     * @param {HTMLElement} scrollContainer - Scroll element. You can use
     *                                {@link StickyViewController.global} for
     *                                the global scrolling element. This should
     *                                be a parent of elem.
     * @param {ScrollProperty} [prop=margin] - Property to use to offset scroll.
     */
    constructor(elem, scrollContainer, prop = ScrollProperty.margin) {
        super();
        elem.controller = this;

        this._elem = elem;

        this._scrollContainer = scrollContainer;
        this._prop = prop;

        this._isSticky = false;

        this._initalPosition = this._elem.style.position;

        this._reloadView();
        this._setUpdateContainer(this._scrollContainer);
    }

    _setUpdateContainer(container) {
        this._scrollContainer.addEventListener("scroll", ::this._reloadView);
    }

    _reloadView() {
        // // The offset of the element (from viewport)
        // const relativeOffset = this._elem.offsetTop - this._scrollContainer.offsetTop;
        //
        // if (this._scrollContainer.scrollTop > relativeOffset) {
        //     if (this._isSticky !== true) {
        //         this._elem.style.position = 'fixed';
        //         this._isSticky = true;
        //     }
        // } else {
        //     if (this._isSticky !== false) {
        //         this._elem.style.position = this._initalPosition;
        //         this._elem.style[this._prop] = '0';
        //         this._isSticky = false;
        //     }
        // }
    }
}
