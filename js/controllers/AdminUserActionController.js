import LoadingButtonController from '~/controllers/LoadingButtonController';
import AdminUserAction from '~/models/Request/AdminUserAction';

import { exhaustMap } from 'rxjs/operators';

/**
 * Controller for any button that performs an admin use raction. Just detects
 * for clicks on the passed element.
 */
export default class AdminUserActionController extends LoadingButtonController {
    /**
     * Creates for a button and a type
     * @param {HTMLElement|string} button. The button or an ID as a string
     * @param {User} user - user to perform on
     * @param {AdminUserActionType} actionType - action to perform
     */
    constructor(button, user, actionType) {
        const buttonElement = typeof button === 'string' ?
            document.getElementById(button) :
            button;

        super(buttonElement);

        /** @type {AdminUserActionType} */
        this.actionType = actionType;

        this.observeClick()
            .pipe(
                exhaustMap(async () => {
                    this.isInProgress = true;

                    await new AdminUserAction(user, actionType).run();

                    this.isInProgress = false;
                    return true;
                }))
            .subscribe(() => {
                window.location.reload();
            });
    }
}
