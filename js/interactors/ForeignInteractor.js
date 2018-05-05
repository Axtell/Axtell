import HexBytes from '~/modern/HexBytes';

const digestIdentifier = 'foreign-digest';
const digestDelta = 'foreign-digest-delta';
const writeDeltaName = 'write-delta';
const minDelta = 1000*60*60*24;
export const foreignDigest = do {
	let now = Date.now();
	let digest = localStorage.getItem(digestIdentifier);
	let delta = localStorage.getItem(digestDelta) || now;
	if (!digest || now - delta > minDelta) {
		digest = HexBytes.ofLength(32);
		localStorage.setItem(digestIdentifier, digest);
		localStorage.setItem(digestDelta, now);
	}
	digest;
};

export function writeDelta(id) {
	return function(name) {
		return `${writeDeltaName}:${id}:${name}`;
	}
}

export function writeKey(id) {
	return function(key) {
		return `${id}:${key}`;
	}
}

export default class ForeignInteractor {
	/**
	 * Creates a foreign interactor with a URL target
	 * @param {string} target Target WITHOUT trailing `/`
	 */
	constructor(target) {
		this._id = `${foreignDigest}:${HexBytes.ofLength(16)}`;
		this._key = writeKey(this._id);
		this._writeDelta = writeDelta(this._id);
		this._target = target;
		this._managedKeys = [];

		this._lastQueues = new Map();

		// Clean up
		window.addEventListener("beforeunload", (event) => {
			// TODO:
			for (let i = 0; i < this._managedKeys.length; i++) {
				localStorage.removeItem(this._key(this._managedKeys[i]));
				localStorage.removeItem(this._writeDelta(this._managedKeys[i]));
			}
		});
	}

	/**
	 * Obtains the id. Should not be externally accessible.
	 * @type {string}
	 */
	get id() { return this._id; }

	/**
	 * Sends a key to a listening target.
	 * @param {string} key   Key of value
	 * @param {string} value Value to recieve
	 */
	sendKey(key, value) {
		this._managedKeys.push(key);
		this.updateDelta(key);
		localStorage.setItem(this._key(key), value);
	}

	/**
	 * Queues a key with a time delay.
	 * @param {string} key Key of value
	 * @param {number} time Time to send key after
	 * @param {string} value Value of key
	 */
	queueKey(key, time, value) {
		clearTimeout(this._lastQueues.get(key));
		this._lastQueues.set(
			key,
			setTimeout(() => this.sendKey(key, value), time)
		);
	}

	/**
	 * Launches interactor child. Optimally send keys before launch
	 */
	launch() {
		window.open(this.link, '_blank');
	}

	/**
	 * @type {string}
	 */
	get link() {
		return `${this._target}/${this._id}?f=1`;
	}

	/**
	 * Updates write delta.
	 */
	updateDelta(key) {
		localStorage.setItem(this._writeDelta(key), Date.now());
	}
}
