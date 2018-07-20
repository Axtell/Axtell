import ProgressButtonController from '~/controllers/ProgressButtonController';
import ButtonTemplate from '~/template/ButtonTemplate';
import ErrorManager from '~/helpers/ErrorManager';

/**
 * A loading button thing
 */
export default class ProgressButtonTemplate extends ButtonTemplate {
    /**
     * @param {Object} options See {@link ButtonTemplate}
     */
    constructor({ ...options }) {
        super(options);

        /** @type {ProgressButtonController} */
        this.controller = new ProgressButtonController(this.underlyingNode);
    }

    /** @override */
    async trigger() {
        this.controller.setLoadingState(true);

        try {
            await super.trigger();
        } catch(error) {
            ErrorManager.report(error)
        }

        this.controller.setLoadingState(false);
    }
}
