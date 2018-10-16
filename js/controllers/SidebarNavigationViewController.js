import ViewController from '~/controllers/ViewController';

import anime from 'animejs';
import { fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

export const ACTIVE_SECTION_CLASS_NAME = 'sidebar-navigation__open';
export const ACTIVE_LINK_OPEN = 'sidebar-navigation__active';

/**
 * Controller for navigation controller
 */
export default class SidebarNavigationViewController extends ViewController {
    /**
     * @param {HTMLElement} navigation - semantic nav element
     */
    constructor(navigation) {
        super(navigation);

        /**
         * Navigation root
         * @type {HTMLElement}
         */
        this.navigation = navigation;

        /**
         * Section elements
         * @type {HTMLAnchorElement}
         */
        this.sections = Array.from(this.navigation.getElementsByClassName('sidebar-navigation__title'));

        /**
         * Pairs of sections to items
         * @param {Map<HTMLAnchorElement, HTMLUListElement>} titlePairs
         */
        this.titlePairs = new Map(
            this.sections
                .map(element => [
                    element,
                    element.nextElementSibling
                ])
        );

        /** @private */
        this.animationQueue = null;

        // Initialize RxJS
        fromEvent(this.sections, 'click')
            .pipe(
                map(event => event.target),
                map(title => this.titlePairs.get(title)))
            .subscribe(
                (section) => {

                this.beginQueue();

                this.closeAllSections();
                this.toggleSection(section, true);

                this.finishQueue();
            });
    }

    /**
     * Begin animation queue
     */
    beginQueue() {
        this.animationQueue = anime.timeline({ autoplay: false });
    }

    /**
     * Finishes queue and plays animation
     */
    finishQueue() {
        this.animationQueue.play();
    }

    /**
     * Toggles a given section by the anchor
     * @param {?HTMLUListElement} section - Does nothing if this is null
     * @param {boolean} isOpen
     */
    toggleSection(section, isOpen) {
        this.animationQueue.add({
            targets: section,
            easing: 'easeOutCubic',
            elasticity: 0,
            height: isOpen ? (section.scrollHeight || '100%') : '0',
            offset: 0,
            duration: 200,
            begin: () => section.classList.add(ACTIVE_SECTION_CLASS_NAME)
        });
    }

    /**
     * Closes all open sections
     */
    closeAllSections() {
        for (const section of this.getOpenSections()) {
            this.toggleSection(section, false);
        }
    }

    /**
     * Gets currently active selections
     * @return {HTMLAnchorElement[]}
     */
    *getOpenSections() {
        for (const section of this.titlePairs.values()) {
            if (section.classList.contains(ACTIVE_SECTION_CLASS_NAME)) {
                yield section;
            }
        }
    }
}
