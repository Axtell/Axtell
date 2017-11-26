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
}
