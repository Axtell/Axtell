import ViewController from '~/controllers/ViewController';
import ErrorManager from '~/helpers/ErrorManager';

export const INVALID_ITEM_GROUP_STRUCTURE = Symbol('ItemGroup.Error.InvalidStructure');

/**
 * Manages an input allowing the user to reset and set other state indicators
 * such as `- Saved`.
 *
 *  - **HTML:** `.rc-group ( label, input )`
 */
export default class ItemGroupViewController extends ViewController {
    constructor(rcgroup) {
        super(rcgroup);

        this._root = rcgroup;

        this._label = this._root.getElementsByTagName('label')[0];
        this._input = this._root.getElementsByTagName('input')[0];

        this._resetTrigger = <a class="active">Revert</a>;
        this._modifiedLabel = (
            <span class="rc-label">&mdash; Modified ({ this._resetTrigger })</span>
        );

        if (!this._label || !this._input) {
            ErrorManager.raise(`Missing label or input`, INVALID_ITEM_GROUP_STRUCTURE);
        }

        this._originalState = this._input.value;
        this._isModified = false;
        this._input.addEventListener('input', ::this._registerChange);
        this._resetTrigger.addEventListener('click', ::this.revert)
    }

    _registerChange() {
        // This means the state change. We'll now store the new state
        this._setModified(this._originalState !== this._input.value);
    }

    /**
     * Reverts state
     */
    revert() {
        if (this._originalState) {
            this._input.value = this._originalState;
            this._setModified(false);
        }
    }

    _setModified(state) {
        this._isModified = state;
        // Check if already in dom
        if (this._modifiedLabel.parentNode) {
            if (state === false) {
                this._label.removeChild(this._modifiedLabel);
            }
        } else {
            // Not in dom
            if (state === true) {
                this._label.appendChild(this._modifiedLabel);
            }
        }
    }
}
