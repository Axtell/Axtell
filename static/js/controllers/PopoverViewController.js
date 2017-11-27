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

        this._isActive = false;

        this._parent = template.getParent(document.body);
        this._node.classList.add("template");

        if (this._node.parentNode === null) {
            this._parent.appendChild(this._node);
        }

        // Setup hide trigger
        document.addEventListener("click", (event) => {
            if (this._isActive) {
                let target = event.target;
                if (this._node.contains(target) ||
                    this._trigger.contains(target)) return;

                this.untrigger();
            }
        });

        this.bindTrigger(trigger);
    }

    /**
     * Adds a new trigger node.
     * @param {string|HTMLElement} trigger - A new trigger to add
     */
    bindTrigger(trigger) {
        if (typeof trigger === 'string') {
            trigger = document.getElementById(trigger);
        }

        trigger.addEventListener("click", () => {
            this.trigger();
        }, false);
    }

    /**
     * Binds an untrigger node.
     * @param {string|HTMLElement} untrigger - A new untrigger to add
     */
    bindUntrigger(untrigger) {
        if (typeof untrigger === 'string') {
            untrigger = document.getElementById(untrigger);
        }

        untrigger.addEventListener("click", () => {
            this.untrigger();
        }, false);
    }

    /**
     * Sets into an active state
     */
    trigger() {
        this._isActive = true;
        this._trigger.classList.add("state-active");
        this._node.classList.remove("template");
        this._node.focus();
    }

    /**
     * Sets into inactive state.
     */
    untrigger() {
        this._isActive = false;
        this._trigger.classList.remove("state-active");
        this._node.classList.add("template");
    }
}
