import ViewController from '~/controllers/ViewController';

/**
 * Controls a popover view. This has a trigger and a target. When the trigger is
 * pressed, this displays the target.
 */
export default class PopoverViewController extends ViewController {
    /**
     * Creates a popover view with a given trigger + target.
     * @param  {HTMLElement} trigger binds `onclick` as a trigger to this node.
     * @param  {Template} template will display this view on trigger.
     */
    constructor(trigger, template) {
        super();
        
        this._trigger = trigger;
        this._node = template.unique();
        
        this._parent = template.getParent(document.body);
        this._node.classList.add("template");
        if (this._node.parentNode === null) {
            this._parent.appendChild(this._node);
        }
        
        this._node.addEventListener("focusout", () => {
            this.untrigger();
        });
        
        if (!(this._node.tabIndex >= 0)) {
            this._node.tabIndex = 0;
        }
        
        this.bindTrigger(trigger);
    }
    
    /**
     * Adds a new trigger node.
     * @param {HTMLElement} trigger - A new trigger to add
     */
    bindTrigger(trigger) {
        trigger.addEventListener("click", () => {
            this.trigger();
        }, false);
    }
    
    /**
     * Sets into an active state
     */
    trigger() {
        this._trigger.classList.add("state-active");
        this._node.classList.remove("template");
        this._node.focus();
    }
    
    /**
     * Sets into inactive state.
     */
    untrigger() {
        this._trigger.classList.remove("state-active");
        this._node.classList.add("template");
    }
}
