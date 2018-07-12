import Template from '~/template/Template';
import Theme from '~/models/Theme';
import SwappingTemplate from '~/template/SwappingTemplate';
import ErrorManager from '~/helpers/ErrorManager';

/**
 * The checklist in the header
 */
export default class WritePostTabChecklist extends Template {
    constructor(items) {
        super(<div class="write-post__subheader__list__step__checklist"/>);

        for (const item of items) {
            item.loadInContext(this.underlyingNode);
        }

        this._items = items;
    }

    /** @type {Boolean} */
    get isComplete() {
        return this._items.every(item => item.state === CheckState.Done);
    }
}

export const CheckState = {
    Todo: Symbol('WritePost.Tab.Checklist.Item.CheckState.Todo'),
    Done: Symbol('WritePost.Tab.Checklist.Item.CheckState.Done'),
    Error: Symbol('WritePost.Tab.Checklist.Item.CheckState.Error'),
};

export const BadCheckState = Symbol('WritePost.Tab.Checklist.Item.Error.CheckState.BadState');

/**
 * A checklist item
 */
export class WritePostTabChecklistItem extends Template {
    constructor(name) {
        super(<div class="write-post__subheader__list__step__checklist__item"/>);

        this.icon = new SwappingTemplate();

        this.underlyingNode.appendChild(
            <DocumentFragment>
                { this.icon.unique() }
                <span>{ name }</span>
            </DocumentFragment>
        );

        this._state = null;

        this.state = CheckState.Todo;
    }

    set state(state) {
        if (this._state === state) return;
        this._state = state;
        this.icon.controller.displayAlternate(WritePostTabChecklistItem.imageForState(state));
    }

    get state() { return this._state; }

    /**
     * Binds checklist to LabelGroup's "live constraint" feature
     * @param {LabelGroup} labelGroup
     */
    bindLabelGroup(labelGroup) {
        labelGroup.validationDelegate.didSetStateTo = (labelGroup, isValid) => {
            if (isValid) {
                this.state = CheckState.Done;
            } else {
                this.state = CheckState.Error;
            }
        };
    }

    static imageForState(state) {
        switch (state) {
        case CheckState.Todo:
            return new Template(<img src={Theme.current.staticImageForTheme('todo-circle')}/>);
        case CheckState.Done:
            return new Template(<img src={Theme.current.staticImageForTheme('check')}/>);
        case CheckState.Error:
            return new Template(<img src={Theme.current.staticImageForTheme('cross')}/>);
        default:
            ErrorManager.raise(`Bad state ${state?.toString()}`, BadCheckState);
        }
    }
}
