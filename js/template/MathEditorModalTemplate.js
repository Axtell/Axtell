import ProgressButtonController from '~/controllers/ProgressButtonController';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import ModalController from '~/controllers/ModalController';
import ModalTemplate from '~/template/ModalTemplate';
import { MathQuill } from '~/helpers/LazyLoad';
import LoadingIcon from '~/svg/LoadingIcon';
import Theme from '~/models/Theme';

// All greek letters that are greek-specific
export const GREEK_LETTERS = "alpha beta Gamma gamma Lambda lambda Delta delta epsilon zeta eta Theta theta iota kappa mu nu Xi xi Pi pi Psi psi rho Sigma sigma tau Upsilon upsilon Phi phi chi Omega omega";

/**
 * Math Editor Modal dialog.
 * @extends {ModalTemplate}
 */
export default class MathEditorModalTemplate extends ModalTemplate {
    /** @override */
    constructor(delegate = null) {
        const addButton = new ProgressButtonController(
            <button class="button button--color-accent button--size-small button--padding-top">Add Math</button>
        );

        const loadingSign = <img src={Theme.current.imageForTheme('loading')}/>;

        super(
            "Add Equation",
            <div>
                <div class="label-group item-wrap">
                    <label>Type Math</label>
                    { loadingSign }
                    { addButton.button }
                </div>
            </div>
        );

        this._loadingSign = loadingSign;

        this._addButton = addButton;
        this._addButton.setLoadingState(true);
    }

    /**
     * Setup view once loaded
     */
    async willLoad() {
        const MQ = await MathQuill();

        const editor = MQ.MathField(<div class="text-base text-input text-input--pad-all"></div>, {
            autoCommands: `sum sqrt prod mid forall exists implies iff ldots int ${GREEK_LETTERS} pm gt lt ge le times div cdot langle rangle partial equiv`
        });
        this._loadingSign.parentNode.replaceChild(editor.el(), this._loadingSign);

        this._addButton.setLoadingState(false);
        this._addButton.delegate.didSetStateTo = () => this.addMath(editor.latex());
    }

    /**
     * Adds the math
     * @param {string} latex The LaTeX string
     */
    addMath(latex) {
        this.delegate?.didSetStateTo(this, latex);
        ModalController.shared.dismiss();
    }

}
