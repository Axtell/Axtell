import ViewController from '~/controllers/ViewController';

export default class HeaderViewController extends ViewController {
    static _shared = null;
    static get shared() {
        if (this._shared) return this._shared;
        else return this._shared = new HeaderViewController(document.getElementById("header"));
    }

    constructor(wrapper) {
        super(wrapper);
        this._wrapper = wrapper;
        this._lastSubheader = wrapper;
    }

    /**
     * Adds a subheader
     * @param {Template} template - Preinstantiated instance
     */
    addSubheader(template) {
        this._lastSubheader.classList.add('header--transparent');
        this._lastSubheader.classList.remove('header--shadow');

        const instance = template.loadBeforeContext(this._lastSubheader.nextSibling);
        instance.classList.add('header--shadow');
    }
}
