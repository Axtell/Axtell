import SwappingTemplate from '~/template/SwappingTemplate';
import ErrorManager from '~/helpers/ErrorManager';
import Template from '~/template/Template';
import Theme from '~/models/Theme';

export const ConstraintState = {
    Todo: Symbol('ConstraintState.Todo'),
    Done: Symbol('ConstraintState.Done'),
    Error: Symbol('ConstraintState.Error'),
};

export const BadConstraintState = Symbol('ConstraintState.BadState');

export default class ConstraintStateTemplate extends Template {
    /**
     * @param {string} text - what to show for item
     */
    constructor(text) {
        super(<div class="constraint-state"/>);

        this.icon = new SwappingTemplate();

        this.underlyingNode.appendChild(
            <DocumentFragment>
                { this.icon.unique() }
                <span>{ text }</span>
            </DocumentFragment>
        );

        this._state = null;

        this.state = ConstraintState.Todo;
    }

    set state(state) {
        // Don't do anything if same
        if (this._state === state) return;
        this._state = state;
        this.icon.controller.displayAlternate(ConstraintStateTemplate.imageForState(state));
    }

    get state() { return this._state; }

    static imageForState(state) {
        switch (state) {
        case ConstraintState.Todo:
            return new Template(<img src={Theme.current.staticImageForTheme('todo-circle')}/>);
        case ConstraintState.Done:
            return new Template(<img src={Theme.current.staticImageForTheme('check')}/>);
        case ConstraintState.Error:
            return new Template(<img src={Theme.current.staticImageForTheme('cross')}/>);
        default:
            ErrorManager.raise(`Bad state ${state?.toString()}`, BadConstraintState);
        }
    }
}
