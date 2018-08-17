import Template from '~/template/Template';
import SVG from '~/models/Request/SVG';

const hidePNRequest = 'axtell-pn-hidden';

/**
 * Little bubble asking for enabling PNs
 */
export default class PushNotificationRequestTemplate extends Template {
    /**
     * Creates given PushNotification object
     * @param {PushNotification} pushNotification
     */
    constructor(pushNotification) {
        const root = <div class="notification"/>;
        super(root);

        return (async () => {
            const notificationIcon = await SVG.load('conversation');

            const enableButton = (
                <a class="notification__detail notification__detail--style-link">Enable</a>
            );

            const hideButton = (
                <a class="notification__detail notification__detail--style-disabled-link">Hide</a>
            );

            root.appendChild(
                <DocumentFragment>
                    <div class="notification__details">
                        <div class="notification__detail">{ notificationIcon }</div>
                        <div class="notification__detail notification__detail--size-wide">
                            <h3>Enable Push Notifications?</h3>
                            <h4>Get notified about outgolfs and other events right to your desktop. We don't spam</h4>
                        </div>
                    </div>
                    <div class="notification__details notification__details--pad-top">
                        <div class="notification__detail notification__detail--size-wide"></div>
                        { enableButton }
                        { hideButton }
                    </div>
                </DocumentFragment>
            );

            this.pushNotification = pushNotification;

            hideButton.addEventListener('click', () => { this.disable() });
            enableButton.addEventListener('click', () => { this.enable() });

            return this;
        })();
    }

    /**
     * Enabled PNs
     */
    enable() {
        this.pushNotification.requestPriviledge()
            .then(hasPriviledge => {
                if (!hasPriviledge) this.failedActivation();
                else this.activated();
            })
            .catch(() => { this.failedActivation() });
    }

    /** @private */
    activated() {
        this.hide();
    }

    /** @private */
    failedActivation() {
        alert('An error occured enabling Push Notifications. Your browser may not support them');
        this.hide();
    }

    /**
     * Hides dialog
     */
    disable() {
        this.pushNotification.forbiddenRequest = true;
        this.hide();
    }

    /**
     * Removes dialog
     */
    hide() {
        this.removeFromContext();
    }
}
