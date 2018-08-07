/**
 * chooses a service worker
 * @typedef {Object} Worker
 * @param {string} pushNotifications - PN SW
 */
export const Workers = {
    pushNotifications: 'PushNotifications'
};

/**
 * Loads service worker
 * @param {Worker} name
 * @async
 */
export default function serviceWorker(name) {
    return new Promise((resolve, reject) => {
        if ('serviceWorker' in navigator) {
            navigator
                .serviceWorker.register(`${PUBLIC_PATH}/axtell.sw.${name}.js`)
                .then(resolve, reject);
        } else {
            reject(new TypeError('ServiceWorkers not available'));
        }
    });
}
