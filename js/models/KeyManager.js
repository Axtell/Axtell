import ErrorManager from '~/helpers/ErrorManager';

export const KeyAlreadyRegistered = Symbol('KeyManager.Error.KeyAlreadyRegistered');

/**
 * Centralizes key management. `.shared` is for `document`. You can create your
 * own for a specific element.
 *
 * Priority:
 *  - Meta handlers
 *  - Generic handlers
 */
export default class KeyManager {
    /**
     * New key manager. Generally you want to use the global `KeyManager.shared`
     * @param {HTMLElement} target Target to watch for
     */
    constructor(target) {
        this._target = target;
        this._handler = ::this._handle;

        this._target.addEventListener("keydown", this._handler);

        this._metaListeners = new Map();
        this._defaultListeners = new Map();
    }

    _handle(event) {
        // Don't do anything if propogation stopped
        if (event.defaultPrevented) return;

        let listener;
        if ((event.ctrlKey || event.metaKey) && (listener = this._metaListeners.get(event.key))) {
            listener(event);
            event.preventDefault();
        } else if (listener = this._defaultListeners.get(event.key)) {
            listener(event);
            event.preventDefault();
        }
    }

    /**
     * Registers an event for a key.
     *
     * @param {string} key - A key matching `event.key` to be watched for
     * @param {Function} callback - Called when finished
     * @return {Function} Call to remove handler
     * @throws {Error} Will throw an error if already registered.
     */
    register(key, callback) {
        if (this._defaultListeners.has(key)) {
            ErrorManager.warn(`Callback exists for generic handler for ${key}`, KeyAlreadyRegistered);
            return;
        }

        this._defaultListeners.set(key, callback);
        return () => this._defaultListeners.delete(key);
    }

    /**
     * Registers an event for a key combo w/ meta e.g, ctrl or command.
     *
     * @param {string} key - A key matching `event.key` to be watched for
     * @param {Function} callback - Called when finished
     * @return {Function} call to remove handler.
     * @throws {Error} Will throw an error if already registered.
     */
    registerMeta(key, callback) {
        if (this._metaListeners.has(key)) {
            ErrorManager.warn(`Callback exists for meta handler for ${key}`, KeyAlreadyRegistered);
            return;
        }

        this._metaListeners.set(key, callback);
        return () => this._metaListeners.delete(key);
    }

    static _shared = null;
    static get shared() {
        if (this._shared !== null) return this._shared;
        else return this._shared = new KeyManager(document);
    }
}
