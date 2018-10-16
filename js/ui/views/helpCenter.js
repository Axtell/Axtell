import SidebarNavigationViewController from '~/controllers/SidebarNavigationViewController';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import Data, { Key } from '~/models/Data';

const helpCenter = Data.shared.encodedJSONForKey(Key.helpCenter);
if (helpCenter) {
    const navigationRoot = document.getElementById('help-navigation');
    new SidebarNavigationViewController(navigationRoot);
}
