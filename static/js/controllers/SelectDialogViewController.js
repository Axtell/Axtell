import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import PopoverViewController from '~/controllers/PopoverViewController'
import Template from '~/template/Template';
import { forEach, find } from '~/modern/array';

/**
 * Manages a select dialog drop-down
 * @implements {ActionControllerDelegate}
 */
export default class SelectDialogViewController extends PopoverViewController {
    /**
     * Creates a select-dialog from an HTML template.
     * @param {Template} button Template of a `.select-dialog`
     */
    constructor(button) {
        let node = button.unique();
        let trigger = node.getElementsByTagName("span")[0];
        let view = new Template(
            node.getElementsByClassName("drop")[0]
        );

        super(trigger, view);

        this._activeValue = node.getElementsByTagName("a")[0];
        this._opts = node.getElementsByClassName("opt");

        this._opts::forEach(opt => {
            opt.addEventListener("click", (event) => {
                this._setState(opt);
            }, false);
        });

        /**
         * An action delegate.
         * @type {ActionControllerDelegate}
         */
        this.didSetStateTo = () => void 0;

        this._setState(this._opts[0]);
    }

    _setName(name) {
        let child;
        while (child = this._activeValue.firstChild) {
            this._activeValue.removeChild(child);
        }
        this._activeValue.appendChild(document.createTextNode(name));
    }

    _setState(option) {
        this._opts::forEach(opt => {
            if (opt === option) {
                opt.classList.add('state-active');
            } else {
                opt.classList.remove('state-active');
            }
        });
        let state = option.textContent.trim();
        this.didSetStateTo({ id: state }, this);
        this._setName(option.textContent.trim());
        this.untrigger();
    }

    setState(option) {
        this._setState(
            this._opts::find(opt => opt.textContent.trim() === option)
        )
    }
}
