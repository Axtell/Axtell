import Data, { EnvKey } from '~/models/Data';
import ErrorManager, { AnyError } from '~/helpers/ErrorManager';
import WebPushNewDevice from '~/models/Request/WebPushNewDevice';
import WebAPNToken from '~/models/Request/WebAPNToken';
import WebPushKey from '~/models/Request/WebPushKey';
import ServiceWorker from '~/helpers/ServiceWorker';

export const PNAPNUnknownResponseState = Symbol('PN.APN.Error.UnknownResponseState');

/**
 * Manages push notifications across different platforms.
 */
export default class PushNotification {
    /**
     * The main PN service
     * @type {PushNotification}
     */
    static shared = new PushNotification({
        webAPNId: Data.shared.envValueForKey(EnvKey.webAPNId) || null
    });

    /**
     * Creates PN but you probably want to use {@link PushNotification.shared}
     * @param {Object} [options={}]
     * @param {?string} options.webAPNId - The web APN ID or null if not supported.
     */
    constructor({ webAPNId = null } = {}) {
        /**
         * Apple Web Push Notification ID
         * @readonly
         * @type {?string}
         */
        this.webAPNId = webAPNId;
    }

    /**
     * Checks if PNs are supported
     * @type {boolean}
     */
    get supportsPNs() {
        // Chrome implementation is buggy, disabled for now.
        if (window.chrome) return false;
        return this.usePush || this.useAPN;
    }

    /**
     * If to use Push flow
     * @type {string}
     */
    get usePush() { return !!('PushManager' in window); }

    /**
     * If to use APN flow
     * @type {boolean}
     */
    get useAPN() { return !!global.safari?.pushNotification }

    /**
     * If Push is setup. We will always assume true
     * @type {boolean}
     */
    get backendSupportsPush() { return true; }

    /**
     * If APN is setup
     * @type {boolean}
     */
    get backendSupportsAPN() { return this.webAPNId !== null; }

    /**
     * The APN URL. `null` if we don't support
     * @type {?string}
     */
    get apnURL() {
        if (!this.backendSupportsAPN) return null;
        return `${Data.shared.envValueForKey(EnvKey.host)}/webapn`
    }

    /**
     * If has permission to send notifs
     * @type {boolean}
     */
    get hasPermissions() {
        if (this.useAPN) {
            return global.safari.pushNotification.permission(this.webAPNId).permission === "granted";
        } else if (this.usePush) {
            return Notification.permission === 'granted';
        } else {
            return false;
        }
    }

    /**
     * If we should show a request
     */
    get shouldShowRequest() {
        return this.needsRequest && !this.forbiddenRequest
    }

    /**
     * Gets if the user has expressibly forbidden
     * @type {boolean}
     */
    get forbiddenRequest() { return localStorage.getItem('axtell-pn-forbidden') === 'true'; }

    /**
     * Sets if the user has expressibly forbidden
     * @type {boolean}
     */
    set forbiddenRequest(isForbidden) { localStorage.setItem('axtell-pn-forbidden', String(!!isForbidden)); }

    /**
     * If should ask for permission
     * @type {boolean}
     */
    get needsRequest() {
        if (this.useAPN) {
            return global.safari.pushNotification.permission(this.webAPNId).permission === "default";
        } else if (this.usePush) {
            return Notification.permission === 'default';
        } else {
            return false;
        }
    }

    /**
     * If we have been denied perms
     * @type {boolean}
     */
    get denied() {
        // If we don't have perms and can't ask then yeah...
        if (this.useAPN) {
            return global.safari.pushNotification.permission(this.webAPNId).permission === "denied";
        } else if (this.usePush) {
            return Notification.permission === 'denied';
        } else {
            return false;
        }
    }

    /**
     * Requests permission for *desktop* push notifications. If there is already
     * perms this will request again.
     *
     * @async
     * @return {boolean} If priviledge was obtained or not
     */
    requestPriviledge() {
        return new Promise(async (resolve, reject) => {
            // If we don't have permission then ¯\_(ツ)_/¯
            if (this.denied) { return resolve(false) }

            if (this.useAPN) {
                if (!this.backendSupportsAPN) {
                    alert("Axtell instance is not configured for APN");
                    return resolve(false);
                }

                const authorizationToken = await new WebAPNToken().run();
                safari.pushNotification.requestPermission(
                    this.apnURL,
                    this.webAPNId,
                    {
                        token: authorizationToken
                    },
                    ({ deviceToken, permission }) => {
                        if (this.hasPermissions) { resolve(true); }
                        else { resolve(false) };
                    }
                )
            } else if (this.usePush) {
                const key = await new WebPushKey().run();
                const serviceWorker = await ServiceWorker.global();
                const registration = serviceWorker.registration;

                // Request permission
                const permission = await new Promise((resolve, reject) => {
                    const promise = Notification.requestPermission(resolve);
                    if (promise) promise.then(resolve, reject);
                });

                if (!this.hasPermissions) resolve(false);

                const pushSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: key
                });

                // Submit to server
                const deviceId = await new WebPushNewDevice(pushSubscription).run();

                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
}
