import ViewController from '~/controllers/ViewController';
import Theme from '~/models/Theme';

/**
 * Sets an existing `.button` to progress
 */
export default class ProgressButtonController extends ViewController {
    /**
     * Creates a button to wrap the thing
     * @param {HTMLElement} saveButton The element with desired default children.
     */
    constructor(saveButton) {
        super(saveButton);

        /** @private */
        this.inLoadingState = false;

        /** @type {HTMLElement} */
        this.button = saveButton;

        /** @type {HTMLElement[]} */
        this.buttonChildren = [...this.button.childNodes];
    }

    /**
     * Sets into a loading state
     * @param {Boolean} isLoading If loading
     */
    setLoadingState(isLoading) {
        if (isLoading) {
            this.button.classList.add('button--color-disabled');
            this._clearChildren();

            this.button.appendChild(
                <img src={ Theme.dark.imageForTheme('loading') }/>
            );

        } else {
            this.button.classList.remove('button--color-disabled');
            this._clearChildren();

            let tempChildren = document.createDocumentFragment();
            for (let i = 0; i < this.buttonChildren.length; i++) {
                tempChildren.appendChild(this.buttonChildren[i]);
            }
            this.button.appendChild(tempChildren);
        }
    }

    _clearChildren() {
        while (this.button.firstChild) {
            this.button.removeChild(this.button.firstChild);
        }
    }
}
