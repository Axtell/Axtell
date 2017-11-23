import TIO from '~/models/TIO';
import TIORun from '~/models/TIO/TIORun';
import Language from '~/models/Language';
import ErrorManager from '~/helper/ErrorManager';
import ViewController from '~/controllers/ViewController';
import TIOOutputTemplate, {TIOOutputState} from '~/template/TIO/TIOOutputTemplate';

export const NoCode = Symbol('TIO.TIOExecControllerError.NoCode');

/**
 * Adds a TIO-execute button for a client-side class. This relies on structure:
 *
 *     .exec-target[data-lang=LANG_ID]
 *         code: CODE
 *         #trigger
 */
export default class TIOExec extends ViewController {
    /**
     * Adds a TIO exec to an element.
     *
     * @param {TIO} tio - The {@link TIO} instance.
     * @param {HTMLElement} target - Element to append TIO execution from.
     * @param {Template} trigger - Element to trigger run
     * @param {HTMLElement} [context=target] - Context to append execution
     *                                       results in.
     */
    constructor(tio, target, trigger, context = target) {
        super();

        this._tio = tio; // TIO object
        this._target = target; // the exec-target element
        this._trigger = trigger;
        this._context = target;

        // DOM prereqs
        this._context.classList.add('tio-exec');

        let codeElem = target.getElementsByTagName("code");
        if (codeElem.length < 1) {
            ErrorManager.raise(`No <code> element found.`, NoCode);
        }

        // Set info
        this._code = codeElem[0].textContent;
        this._lang = new Language(this._target.dataset.lang.toLowerCase());
        
        // Setup DOM
        this._trigger = trigger.loadInContext(this._context);
        this._trigger.addEventListener("click", () => {
            this.run();
        }, false);

        this._output = new TIOOutputTemplate();
        this._output.loadInContext(this._context);
    }

    /**
     * Runs the code
     */
    run() {
        let instance = new TIORun(this._code, this._lang);
        instance.run()
            .then((result) => {
                this.setState(result);
            })
            .catch((error) => {
                ErrorManager.silent(error, `Error performing TIO request.`);
            });
    }

    /**
     * Handle completion
     * @param {TIOResult} state - Result of the TIO request.
     */
    setState(state) {
        if (state.isError) {
            this._output.setText(state.getError);
            this._output.setState(TIOOutputState.STDERR);
        } else {
            this._output.setText(state.getOutput);
            this._output.setState(TIOOutputState.STDOUT);
        }
    }
}
