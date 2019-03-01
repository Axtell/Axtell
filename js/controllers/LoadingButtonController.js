import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import ProgressButtonController from '~/controllers/ProgressButtonController';
import Theme from '~/models/Theme';

import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Allows button classes with images to have a loading/disabled state. Expects
 * an SVG as the image.
 *
 * This is a better version of {@link ProgressButtonController} that supports
 * reactive observables.
 */
export default class LoadingButtonController extends ProgressButtonController {
    /**
     * Creates a button to wrap the thing.
     * @param {HTMLElement} button The element with desired default children.
     */
    constructor(button) {
        super(button);

        /** @type {HTMLElement} */
        this.button = button;

        this._buttonIcon = button.getElementsByTagName('svg')[0];

        this._isDisabled = false;

        this._observeClick = fromEvent(button, 'click')
            .pipe(
                filter(() => !this._isDisabled));
    }

    /**
     * If the button is in progress
     * @return {Boolean}
     */
    set isInProgress(isInProgress) {
        this.setLoadingState(isInProgress);
    }

    /**
     * Observes the click of the button
     * @return {Observable}
     */
    observeClick() {
        return this._observeClick;
    }
}
