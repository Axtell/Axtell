import Random from '~/modern/Random';

const foreignPrefix = 'foreign';
const digestIdentifier = `${foreignPrefix}-digest`;
const digestDelta = `${foreignPrefix}-digest-delta`;
const writeDeltaName = `${foreignPrefix}-write-delta`;
const writeKeyName = `${foreignPrefix}-key`;
const minDelta = 1000*60*60*24;
export const foreignDigest = do {
	let now = Date.now();
	let digest = localStorage.getItem(digestIdentifier);
	let delta = localStorage.getItem(digestDelta) || now;
	if (!digest || now - delta > minDelta) {
		digest = Random.ofLength(32);
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
		return `${writeKeyName}:${id}:${key}`;
	}
}

export const sameTabIds = new Map();

function queueLocalTick(instanceId) {
	const callbacks = sameTabIds.get(instanceId);
	for (let i = 0; i < callbacks.length; i++) {
		callbacks[i]();
	}
}

export default class ForeignInteractor {
	/**
	 * Creates a foreign interactor with a URL target
	 * @param {string} target Target WITHOUT trailing `/`
	 */
	constructor(target) {
		this._id = `${foreignDigest}:${Random.ofLength(16)}`;
		this._key = writeKey(this._id);
		this._writeDelta = writeDelta(this._id);
		this._target = target;
		this._managedKeys = [];

		this._lastQueues = new Map();

		sameTabIds.set(this._id, []);

		// Clean up
		window.addEventListener("beforeunload", (event) => {
			Object.keys(localStorage)
				.filter(key => key.indexOf(foreignPrefix) === 0)
				.forEach(key => { localStorage.removeItem(key); });
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

		queueLocalTick(this._id);
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
	 * Launches interactor child. Optimally send keys before launch.
	 * Requires a user 'blessing' (triggering event chain) for this
	 * to work.
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
