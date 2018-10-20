import ProfileSettingsView from '~/template/ProfileSettings/ProfileSettingsView';
import LoginMethods from '~/models/Request/LoginMethods';
import RemoveLoginMethod from '~/models/Request/RemoveLoginMethod';
import LoginMethodTemplate from '~/template/LoginMethodTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import HeaderTemplate from '~/template/HeaderTemplate';

import { merge } from 'rxjs/index';
import { exhaustMap } from 'rxjs/operators';

/**
 * Modify logins view
 */
export default class ProfileSettingsViewLogins extends ProfileSettingsView {
    constructor(data) {
        const root = <div/>;
        super(data, root);

        new HeaderTemplate('Logins', {
            level: 3
        }).loadInContext(root);

        this.loginSwapper = new LoadingTemplate();
        this.loginSwapper.loadInContext(root);
    }

    /** @overrude */
    async didInitialLoad() {
        super.didInitialLoad();

        const loginMethods = await new LoginMethods().run();
        const loginTemplates = loginMethods
            .sort((a, b) => b.lastUsed - a.lastUsed)
            .map(method => new LoginMethodTemplate(method, loginMethods.length > 1));

        // Handle remove behavior
        merge(
            // Watch for remove button
            ...loginTemplates
                .map(template => template.observeRemove()))
            .pipe(
                // We'll async remove templates, queueing up in order they cmome
                exhaustMap(async (templateToRemove) => {
                    templateToRemove.removeButton.controller.setLoadingState(true);

                    // Disable other buttons
                    loginTemplates
                        // Get other remove buttons
                        .filter(template => template !== templateToRemove && template.removeButton)
                        .map(template => template.removeButton)
                        // Disable other buttons
                        .map(button => button.setIsDisabled(true));

                    // Tell server to remove endpoint
                    const removed = await new RemoveLoginMethod(templateToRemove.loginMethod).run()
                    return true;
                }))
            .subscribe(() => {
                // Refresh page removed
                window.location.reload();
            });


        this.loginSwapper.displayAlternate(
            <div class="login-method__wrapper">
                { loginTemplates.map(template => template.unique()) }
            </div>
        );
    }
}
