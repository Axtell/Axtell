import Template from '~/template/Template';
import NavigationTemplate from '~/template/NavigationTemplate';
import SwappingTemplate from '~/template/SwappingTemplate';

import { from } from 'rxjs/index';
import { map, switchMap, tap, publishReplay, publishLast } from 'rxjs/operators';

const NAVIGATION_HIERARCHY = {
    'Profile': {
        'My Profile': {
            subtitle: 'Change your username, avatar, and other profile settings.',
            view: () => import('~/template/ProfileSettings/ProfileSettingsViewProfile')
        },
        'Manage Logins': {
            subtitle: 'Change or add login providers.',
            view: () => import('~/template/ProfileSettings/ProfileSettingsViewProfile')
        },
    },
    'Appearance': {
        'My Themes': {}
    }
};

/**
 * Wraps all profile settings in a group.
 */
export default class ProfileSettingsTemplate extends Template {
    /**
     * Takes authorized user object.
     * @param {User} user
     */
    constructor(user) {
        const root = <div class="content-division"/>;
        super(root);

        /** @type {NavigationTemplate} */
        this.navigation = new NavigationTemplate(NavigationTemplate.navFromObject(NAVIGATION_HIERARCHY));

        /** @type {SwappingTemplate} */
        this.swapper = new SwappingTemplate();

        root.appendChild(
            <DocumentFragment>
                <aside class="content-division__aside--width-sidebar">{ this.navigation.unique() }</aside>
                <main>{ this.swapper.unique() }</main>
            </DocumentFragment>
        );

        // Link navigation to swapper
        this.navigation
            .observeNavigation()
            .pipe(
                map(([sectionName, itemName]) => [NAVIGATION_HIERARCHY[sectionName][itemName], sectionName, itemName]),
                switchMap(([item, sectionName, itemName]) =>
                    item.cachedValue ||
                    (item.cachedValue =
                        from(item.view())
                            .pipe(
                                map(view => new view.default({
                                    user: user,
                                    root: this,
                                    subtitle: item.subtitle,
                                    itemName: itemName,
                                    sectionName: sectionName }))))))
            .subscribe(view => {
                this.swapper.displayAlternate(view);
            });
    }

    /** @override */
    didLoad() {
        this.navigation.didLoad();
    }
}
