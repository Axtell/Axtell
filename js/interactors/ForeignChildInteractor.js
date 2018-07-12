import { writeDelta, writeKey, foreignDigest, sameTabIds } from '~/interactors/ForeignInteractor';
import ErrorManager from '~/helpers/ErrorManager';

export const FOREIGN_INVALID_ID = Symbol('ForeignChild.Error.InvalidId');

/**
 * Interacts with a {@link ForeignInteractor} as a parent.
 */
export default class ForeignChildInteractor {
	/**
	 * Creates a ForeignChildInteractor based of a primary interactor.
	 * @param {string} instanceId Id from a {@link ForeignIntercator}. Undefined behavior if not valid
	 * @param {number} [tickTimeout=5] A minimum refresh time delta. Will not update
	 *                                 intermediates until delta has expired.
	 */
	constructor(instanceId, tickTimeout = 5) {
		// Validate correct instanceId
		if (instanceId.indexOf(foreignDigest) !== 0) {
			ErrorManager.raise(`Invalid instance ID recieved`, FOREIGN_INVALID_ID);
		}

		this._writeDelta = writeDelta(instanceId);
		this._writeKey = writeKey(instanceId);
		this._watchingKeys = new Map();

		this._tickWatchers = [];

		this._tick = null;

		sameTabIds.get(instanceId)?.push(() => {
			this.queueTick(tickTimeout);
		});

		// Start listening
		window.addEventListener('storage', () => {
			this.queueTick(tickTimeout);
		});
	}

	/**
	 * Watches a key w/ a registered callback
	 *
	 * @param {string} key The key of the value to watch
	 * @param {Function} callback The callback is called with the value.
	 */
	watch(key, callback) {
		let lastDelta = localStorage.getItem(this._writeDelta(key)), keyValue;

		if (keyValue = this._watchingKeys.get(key)) {
			keyValue.lastDelta = lastDelta;
			keyValue.callbacks.push(callback);
		} else {
			this._watchingKeys.set(key, {
				lastDelta: lastDelta,
				callbacks: [callback],
			});
		}

        let value = localStorage.getItem(this._writeKey(key));
		if (value !== null) callback(value);
	}

	/**
	 * Called on a new tick
	 * @param {Function} callback - The callbackl
	 */
	watchTick(callback) {
		this._tickWatchers.push(callback);
	}

	/**
	 * Obtains the last write delta.
	 * @param {strin} key key to get delta for
	 */
	getDelta(key) {
		return localStorage.getItem(this._writeDelta(key));
	}

	/**
	 * Queues an async tick
	 * @param {number} time Time to issue next tick
	 */
	queueTick(time) {
		clearTimeout(this._tick);
		this._tick = setTimeout(() => this.tick(), time);
	}

	/**
	 * Performs update. Automatically managed.
	 */
	tick() {
		let hasChangedKey = null;
		for (let [key, keyData] of this._watchingKeys) {
			let { lastDelta, callbacks } = keyData;

			let latestDelta = this.getDelta(key);
			// If the write time has elapsed they are relevant changes
			if (latestDelta - lastDelta > 0) {
				keyData.lastDelta = latestDelta;
				hasChangedKey = true;
				let value = localStorage.getItem(this._writeKey(key));
				for (let i = 0; i < callbacks.length; i++) {
					callbacks[i](value);
				}
			}
		}

		if (hasChangedKey) {
			for (let i = 0; i < this._tickWatchers.length; i++) {
				this._tickWatchers[i]();
			}
		}
	}
}
