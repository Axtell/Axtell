import ViewController from '~/controllers/ViewController';
import HexBytes from '~/modern/HexBytes';
import Theme from '~/models/Theme';

const CLOSE_ICON = () => (
    <svg namespace="http://www.w3.org/2000/svg" viewBox="0 0 16 16" version="1.1">
        <path namespace="http://www.w3.org/2000/svg" d="M 2.75 2.042969 L 2.042969 2.75 L 2.398438 3.101563 L 7.292969 8 L 2.042969 13.25 L 2.75 13.957031 L 8 8.707031 L 12.894531 13.605469 L 13.25 13.957031 L 13.957031 13.25 L 13.605469 12.894531 L 8.707031 8 L 13.957031 2.75 L 13.25 2.042969 L 8 7.292969 L 3.101563 2.398438 Z " fill="white"></path>
    </svg>
);

export default class CategoryListViewController extends ViewController {
    constructor(element, label = null) {
        super(element);

        this._managedTags = new Map();
        this._managingStack = [];

        this._id = `category-list-${HexBytes.ofDefault()}`;
        if (label) {
            label.htmlFor = this._id;
        }

        this._managingContext = element;
        this._typingContext = <input id={this._id} class="text-base text-input -owned" autocapitalize="none" />
        this._inputContext = <div aria-hidden='true'></div>;

        this._managingContext.appendChild(this._typingContext);
        this._managingContext.appendChild(this._inputContext);

        this._typingContext.addEventListener('keydown', ::this._didInsertCharacter);
    }

    _didInsertCharacter(event) {
        let target = event.target;

        // Test if valid character
        if (!/[A-Za-z-]/.test(event.key)) {
            event.preventDefault();
        }

        // Detect if backspace at beginning
        if (event.key === "Backspace" && target.selectionStart === 0 && target.selectionEnd === 0) {
            this.popTag();
            return;
        }

        // Test if space or comma
        if (/^[ ,;]$/.test(event.key) || event.key === "Enter") {
            let content = target.value.substring(0, target.selectionStart);

            // Get previous selection and shrink current
            target.value = target.value.substring(target.selectionStart);

            this._addSelection(content);
            event.preventDefault()
            return;
        }
    }

    _addSelection(data) {
        let matches = data.match(/[A-Za-z-]+/g);
        if (matches === null) return;
        for (let i = 0; i < matches.length; i++) {
            this.addTag(matches[i].toLowerCase());
        }
    }

    /**
     * Creates tag with a name
     * @param {string} name Name of the tag.
     */
    addTag(name) {
        if (this._managedTags.has(name)) return;

        let close = CLOSE_ICON();
        let label = <span class="input-list-item">{name}{close}</span>
        let input = <input type="hidden" name="post-categories" value={name} />;

        close.addEventListener('click', () => this.removeTag(name));
        this._managingContext.insertBefore(label, this._typingContext);
        this._inputContext.appendChild(input);
        this._managedTags.set(name, { label, input, position: this._managingStack.length });
        this._managingStack.push(name);
    }

    /**
     * Removes the last tag
     */
    popTag() {
        let previousTag = this._managingStack[this._managingStack.length - 1];
        if (previousTag) this.removeTag(previousTag);
    }

    /**
     * Removes a tag. Silent if fails
     * @param {string} name The name of the tag to remove.
     */
    removeTag(name) {
        let tag;
        if (tag = this._managedTags.get(name)) {
            let { label, input, position } = tag;

            // Remove from DOM
            this._managingContext.removeChild(label);

            // Remove from input list
            this._inputContext.removeChild(input);

            // Remove from managedTags
            this._managedTags.delete(name);

            // Remove from stack
            this._managingStack.splice(position, 1);
        }
    }
}
