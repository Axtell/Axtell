import { forEach } from '~/modern/array';

/**
 * Manages a View of any type with iOS-esque handlers.
 */
export default class ViewController {
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
     */
    static forClass(className, predicate = (elem) => [elem]) {
        document.getElementsByClassName(className)::forEach(elem => {
            new this(...predicate(elem));
        })
    }
}
