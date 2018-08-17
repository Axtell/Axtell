//
// Does notification icon in header
//

import Auth from '~/models/Auth';
import NotificationBubbleViewController from '~/controllers/NotificationBubbleViewController';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

export const NOTIFICATION_BUBBLE = document.getElementById("notification-segment");
export const NOTIFICATION_WRAPPER = document.getElementById("notification-wrapper");

(async () => {
    const auth = await Auth.shared;

    if (auth.isAuthorized && NOTIFICATION_BUBBLE) {
        const notificationBubble = await new NotificationBubbleViewController(NOTIFICATION_BUBBLE, NOTIFICATION_WRAPPER);
    }
})().catch(HandleUnhandledPromise);
