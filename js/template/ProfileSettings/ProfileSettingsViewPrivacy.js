import ProfileSettingsView from '~/template/ProfileSettings/ProfileSettingsView';
import { ButtonColor, ButtonStyle } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import ModifyUser from '~/models/Request/ModifyUser';
import PrivacySettings from '~/models/Request/PrivacySettings';

import LoadingTemplate from '~/template/LoadingTemplate';
import CheckboxInputTemplate from '~/template/Form/CheckboxInputTemplate';
import Data, { Key, EnvKey } from '~/models/Data';
import FormConstraint from '~/controllers/Form/FormConstraint';
import LabelGroup from '~/template/Form/LabelGroup';
import Theme from '~/models/Theme';

import { of, combineLatest } from 'rxjs/index';
import { withLatestFrom, exhaustMap, tap, distinctUntilChanged, map, startWith, share } from 'rxjs/operators';

/**
 * Main privacy settings page
 */
export default class ProfileSettingsViewPrivacy extends ProfileSettingsView {
    /** @override */
    constructor(data) {
        const root = <div/>,
            saveButton = new ProgressButtonTemplate({
                text: 'Save',
                color: ButtonColor.green,
                style: ButtonStyle.plain,
            });

        super(data, root, {
            button: saveButton
        });

        /** @private */
        this.swapper = new LoadingTemplate();
        this.swapper.loadInContext(root);

        /**
         * Status of the current view's validation
         * @type {?Observable<boolean>}
         */
        this.observeValidation = null;

        /** @type {ButtonTemplate} */
        this.saveButton = saveButton;
    }

    /** @override */
    async didInitialLoad() {
        await super.didInitialLoad();

        const root = <div/>;

        const privacySettings = await new PrivacySettings().run();

        const followingIsPublic = new LabelGroup(
            'Show who I am following publicly.',
            new CheckboxInputTemplate({
                isEnabled: privacySettings.followingIsPublic
            }),
            {
                isHorizontalStyle: true,
                tooltip: 'You can choose to publicaly hide who you follow or you may make this private. The people who you follow can always see you follow them.'
            }
        );
        followingIsPublic.loadInContext(root);

        this.swapper.displayAlternate(root);

        this.observeValidation = of(true);

        // Add save button
        this.saveButton
            .observeClick()
            .pipe(
                withLatestFrom(
                    combineLatest(
                        followingIsPublic.observeValue(),
                        (followingIsPublic) => ({ followingIsPublic })),
                    (click, data) => data),
                exhaustMap(async ({ followingIsPublic }) => {
                    this.saveButton.controller.setLoadingState(true);

                    const modifyUser = new ModifyUser({
                        followingIsPublic
                    });

                    await modifyUser.run();

                    this.saveButton.controller.setLoadingState(false);
                    return true;
                }))
            .subscribe((status) => {
                window.location.reload();
            });

        this.observeValidation
            .pipe(
                map(isValid => !isValid),
                distinctUntilChanged())
            .subscribe(isInvalid => this.saveButton.setIsDisabled(isInvalid, 'Ensure all fields are correctly completed'))
    }
}
