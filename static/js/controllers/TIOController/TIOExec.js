import TIO from '~/model/TIO';
import ViewController from '~/controllers/ViewController';

/**
 * Adds a TIO-execute button for a client-side class.
 */
export default class TIOExec extends ViewController {
    /**
     * Adds a TIO exec to an element.
     * @param {HTMLElement} target - Element to append TIO execution from.
     */
    constructor(target) {
        this.target = target;
    }
}
