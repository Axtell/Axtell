import ViewController from '~/controllers/ViewController';
import KeyManager from '~/models/KeyManager';

export const c = 'popvc__untrigger';

/**
 * Controls a popover view. This has a trigger and a target. When the trigger is
 * pressed, this displays the target.
 */
export default class PopoverViewController extends ViewController {
    /**
     * Creates a popover view with a given trigger + target.
     * @param {?HTMLElement} root The root element to bind to.
     * @param {HTMLElement} trigger binds `onclick` as a trigger to this node.
     * @param {Template} template will display this view on trigger.
     * @param {?HTMLElement} [untrigger=document] element to untrigger.
     */
    constructor(root, trigger, template, untrigger = document) {
        super(root);

        this._trigger = trigger;
        this._template = template;
        this._node = template.unique();

        this._isActive = false;

        this._parent = template.getParent(document.body);
        this._node.classList.add("template");

        if (this._node.parentNode === null) {
            this._parent.appendChild(this._node);
        }

        this._keyBinding = null;

        const untriggers = this._node.getElementsByClassName('popvc__untrigger');
        for (const localUntrigger of untriggers) {
            this.bindUntrigger(localUntrigger);
        }

        // Setup hide trigger
        untrigger?.addEventListener("click", (event) => {
            if (this._isActive) {
                let target = event.target;
                if (!this._node.contains(untrigger) && (
                    this._node.contains(target) ||
                    this._trigger.contains(target)
                )) { return }

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
        this._template.willLoad();

        this._isActive = true;
        this._trigger.classList.add("state-active");
        this._node.classList.remove("template");

        this._node.focus();

        this._keyBinding = KeyManager.shared.register('Escape', () => {
            this.untrigger();
        });

        this._template.didLoad();
    }

    /**
     * Sets into inactive state.
     */
    untrigger() {
        this._template.willUnload();

        this._isActive = false;
        this._trigger.classList.remove("state-active");
        this._node.classList.add("template");
        this._keyBinding?.();
        this._keyBinding = null;

        this._template.didUnload();
    }
}
