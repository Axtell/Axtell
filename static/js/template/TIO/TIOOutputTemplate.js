import Template, { TemplateType } from '~/template/Template';
import ErrorManager from '~/helper/ErrorManager';
import { filter, forEach } from '~/modern/array';

/**
 * TIO output template. **Unique** instance per template.
 */
export default class TIOOutputTemplate extends Template {
    /** @override */
    constructor() {
        let elem = document.createElement("div");
        elem.classList.add('result');
        
        super(elem, TemplateType.none);
    }
    
    /**
     * Sets the text
     * @type {string} text - String to set to
     */
    setText(text) {
        let node = this.getUnderlyingNode;
        while (node.hasChildNodes()) node.removeChild(node.firstChild);
        node.appendChild(document.createTextNode(text));
    }
    
    /**
     * Sets the TIO state.
     * @param {TIOOutputState} state - output state
     */
    setState(state) {
        let node = this.getUnderlyingNode;
        
        node.classList
            ::filter(className => className.indexOf('state-') === 0)
            ::forEach(::node.classList.remove);
            
        switch(state) {
            case TIOOutputState.Default:
                break;
            case TIOOutputState.STDOUT:
                node.classList.add('state-stdout');
                break;
            case TIOOutputState.STDERR:
                node.classList.add('state-stderr');
                break;
            default:
                ErrorManager.raise(`Invalid state ${state} given.`, TIOOutputBadState);
        }
    }
}

export const TIOOutputBadState = Symbol('TIO.TIOOutputTemplateError.BadState');
export const TIOOutputState = {
    Default: 0,
    STDOUT: 1,
    STDERR: 2
};
