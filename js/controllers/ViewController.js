import ErrorManager from '~/helpers/ErrorManager';
import { forEach } from '~/modern/array';

export const RootNonexistent = Symbol('ViewController.Error.RootNonexistent');

/**
 * Manages a View of any type with iOS-esque handlers.
 */
export default class ViewController {
    /**
     * @param {HTMLElement} root The element to which the controller is associated
     */
    constructor(root) {
        if (root) root.controller = this;
    }

    /**
     * Returns a canolical VC of an element if it exists
     * @param  {string} id Element id (no check if the element does not exist).
     * @return {?ViewController}
     */
    static of(id) {
        let elem;
        if (elem = document.getElementById(id)) {
            return elem.controller || null;
        } else {
            return null;
        }
    }

    /**
     * Creates a view controller directly for all members of a class. You can
     * specify a custom predicate.
     * @param {string} className
     * @param {Function} predicate - Takes elem, return array of params
     * @param {HTMLElement} root - Root element to search from
     */
    static forClass(className, predicate = (elem) => [elem], root = document) {
        if (typeof root === 'string') {
            let rootName = root;
            root = document.getElementById(root);
            if (root === null) {
                ErrorManager.raise(
                    `Initalization root ${rootName} does not exist`,
                    RootNonexistent
                );
            }
        }

        root.getElementsByClassName(className)::forEach(elem => {
            new this(...predicate(elem));
        });
    }
}
