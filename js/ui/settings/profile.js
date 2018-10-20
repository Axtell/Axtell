import Data, { Key } from '~/models/Data';
import Auth from '~/models/Auth';
import ErrorManager, {HandleUnhandledPromise} from '~/helpers/ErrorManager';
import SwappingViewController from '~/controllers/SwappingViewController';

export const isProfileSettingScreen = Data.shared.hasKey(Key.settingsContext);

if (isProfileSettingScreen) {

    (async () => {
        const auth = Auth.shared;
        const user = auth.user;

        if (!user) {
            location.href = '/';
        }

        const mount = new SwappingViewController(document.getElementById("user-settings-mount"));

        const { default: ProfileSettingsTemplate } = await import('~/template/ProfileSettings/ProfileSettingsTemplate');
        mount.displayAlternate(new ProfileSettingsTemplate(user));
    })().catch(HandleUnhandledPromise);

}
