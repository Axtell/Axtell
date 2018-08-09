const serviceWorker = new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator) {
        navigator
            .serviceWorker.register(`${PUBLIC_PATH}/axtell.sw.js`)
            .then(resolve, reject);
    } else {
        reject(new TypeError('ServiceWorkers not available'));
    }
});

/**
 * Call this to get the Axtell server worker.
 * @async
 */
export default class ServiceWorker {
    /**
     * Returns global service worker
     * @return {ServiceWorkerRegistration}
     */
    static async global() {
        return await new ServiceWorker(serviceWorker);
    }

    /**
     * Creates a SW class from a registration promise.
     * @param {Promise<ServiceWorkerRegistration>} sw
     */
    constructor(sw) {
        /**
         * @type {ServiceWorkerRegistration}
         */
        this.registration = null;

        return (async () => {
            this.registration = await sw;
            return this;
        })();
    }
}
