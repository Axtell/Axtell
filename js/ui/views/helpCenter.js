import HelpCenterNavigationViewController from '~/controllers/HelpCenterNavigationViewController';
import Data, { Key } from '~/models/Data';

const helpCenter = Data.shared.encodedJSONForKey(Key.helpCenter);
if (helpCenter) {
    const navigationRoot = document.getElementById('help-navigation');
    const navigationController = new HelpCenterNavigationViewController(navigationRoot);
}
