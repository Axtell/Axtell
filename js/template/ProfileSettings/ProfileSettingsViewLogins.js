import ModalViewController from '~/controllers/ModalViewController';
import AuthModalTemplate from '~/template/login/AuthModalTemplate';
import ProfileSettingsView from '~/template/ProfileSettings/ProfileSettingsView';
import LoginMethods from '~/models/Request/LoginMethods';
import RemoveLoginMethod from '~/models/Request/RemoveLoginMethod';
import LoginMethodTemplate from '~/template/LoginMethodTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import ButtonTemplate, { ButtonColor, ButtonStyle } from '~/template/ButtonTemplate';
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

        const addMethodButton = new ButtonTemplate({
            text: "Add Login",
            color: ButtonColor.minimalGreen,
            style: ButtonStyle.minimal
        });

        addMethodButton.isWide = true;
        addMethodButton.hasPaddedHorizontal = true;

        addMethodButton.loadInContext(root);

        /** @type {ButtonTemplate} */
        this.addMethodButton = addMethodButton;
    }

    /** @overrude */
    async didInitialLoad() {
        super.didInitialLoad();

        // Watch add method button
        const addAuthMethodTemplate = new AuthModalTemplate({
            title: 'Add Login.',
            subtitle: 'Add an authorization method'
        }, {
            clientOnly: true,
            authConfig: {
                append: true
            }
        });

        // Open 'add login' dialog
        this.addMethodButton
            .observeClick()
            .pipe(
                exhaustMap(async () => {
                    ModalViewController.shared.present(addAuthMethodTemplate);
                }))
            .subscribe();


        // Create the login methods
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
