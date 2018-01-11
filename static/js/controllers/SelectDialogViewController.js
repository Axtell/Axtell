import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import PopoverViewController from '~/controllers/PopoverViewController'
import Template from '~/template/Template';
import {find, forEach} from '~/modern/array';

/**
 * State of selection
 * @implements {State}
 */
export class SelectState {
    /**
     * Selection state for id
     * @param {string} id trimmed id
     * @param {HTMLElement} elem
     */
    constructor(id, elem) {
        /**
         * Identifier for state
         * @type {string}
         */
        this.id = id;

        /**
         * Option element
         * @type {HTMLElement}
         */
        this.elem = elem;
    }

    /**
     * @override
     * @return {string}
     */
    toString() { return this.id; }
}

/**
 * Manages a select dialog drop-down
 */
export default class SelectDialogViewController extends PopoverViewController {
    /**
     * Creates a select-dialog from an HTML template.
     * @param {Template} button Template of a `.select-dialog`
     */
    constructor(button) {
        let node = button.unique();
        let trigger = node.getElementsByClassName("select-trigger")[0];
        let view = new Template(
            node.getElementsByClassName("drop")[0]
        );

        super(trigger, view);

        node.controller = this;

        this._activeValue = node.getElementsByTagName("a")[0];
        this._opts = node.getElementsByClassName("opt");

        this._opts::forEach(opt => {
            opt.tabIndex = 0;
            opt.setAttribute("role", "option");

            opt.addEventListener("keydown", (event) => {
                if (document.activeElement === event.target && event.keyCode == 13) {
                    this._setState(opt);
                }
            });

            opt.addEventListener("click", (event) => {
                this._setState(opt);
            }, false);
        });

        /**
         * An action delegate.
         * @type {ActionControllerDelegate}
         */
        this.delegate = new ActionControllerDelegate();

        this._setState(this._opts[0]);
    }

    _setName(name) {
        let child;
        while (child = this._activeValue.firstChild) {
            this._activeValue.removeChild(child);
        }
        this._activeValue.appendChild(document.createTextNode(name));
        this._activeValue.setAttribute('aria-disables', 'true');
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
        this.delegate.didSetStateTo(this, new SelectState(state, option));
        this._setName(state);
        this.untrigger();
    }

    setState(option) {
        this._setState(
            this._opts::find(opt => opt.textContent.trim() === option)
        )
    }
}
