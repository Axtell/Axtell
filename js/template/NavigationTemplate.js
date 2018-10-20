import Template from '~/template/Template';
import SidebarNavigationViewController, { ACTIVE_LINK_OPEN } from '~/controllers/SidebarNavigationViewController';

import { fromEvent, BehaviorSubject } from 'rxjs';
import { tap, distinctUntilChanged, map, filter, mapTo } from 'rxjs/operators';

/**
 * Navigation template for friendly nav.
 */
export default class NavigationTemplate extends Template {
    /**
     * Creates a nav from an object
     * @param {Object} object
     * @return {Array<Array<string, string>>}
     */
    static navFromObject(object) {
        return Object
            .keys(object)
            .map(sectionName => [
                sectionName,
                Object
                    .keys(object[sectionName])
                    .map(itemName => [itemName])
            ])
    }

    /**
     * Takes dyadic-tuple in form of array. Followed by elements and if the
     * second element is href, this is used when emitting clicks.
     * @param {Array<Array<string, string>>} nav Navigation data
     */
    constructor(nav) {
        const root = <nav class="sidebar-navigation"/>;

        super(root);

        let navigationController;
        const navigationSubject = new BehaviorSubject(null)
            .pipe(
                filter(value => value),
                distinctUntilChanged());

        const sections = nav.map(([sectionName, items]) => {
            const sectionItems = items.map(([itemName, target = '#']) => {
                const link = <a class="sidebar-navigation__link" href={target}>{ itemName }</a>;

                fromEvent(link, 'click')
                    .pipe(
                        mapTo([ sectionName, itemName ]))
                    .subscribe(navigationSubject);

                navigationSubject
                    .pipe(
                        map(([section, item]) => section === sectionName && item === itemName),
                        distinctUntilChanged())
                    .subscribe(isCurrentLinkSelected => {
                        link.classList.toggle(ACTIVE_LINK_OPEN, isCurrentLinkSelected);
                    });

                return (
                    <li>
                        { link }
                    </li>
                );
            });

            const sublist = <ul>{ sectionItems }</ul>;
            const section = <a class="sidebar-navigation__title">{ sectionName }</a>;

            navigationSubject
                .pipe(
                    filter(([section]) => section === sectionName),
                    distinctUntilChanged())
                .subscribe(() => {
                    const openSections = [...navigationController.getOpenSections()];

                    // If we navigate to a non-open link, then we'll still open
                    if (!openSections.includes(section)) {
                        navigationController.beginQueue();
                        navigationController.toggleSection(sublist, true);
                        navigationController.finishQueue();
                    }
                });

            return (
                <li>
                    { section }
                    { sublist }
                </li>
            );
        });

        root.appendChild(
            <ul>
                { sections }
            </ul>
        );

        navigationController = new SidebarNavigationViewController(root);

        /** @private */
        const firstSectionName = nav[0][0];
        const firstItemName = nav[0][1][0][0];
        this.firstItem = [firstSectionName, firstItemName];

        /** @private */
        this.navigationSubject = navigationSubject;
    }

    /**
     * Called on didLoad
     */
    didLoad() {
        super.didLoad();
        this.navigationSubject.next(this.firstItem);
    }

    /**
     * Returns navigation subject. Emits non-duplicates in form of
     * like [section, item].
     * @return {BehaviorSubject<Array<string, string>>}
     */
    observeNavigation() {
        return this.navigationSubject;
    }
}
