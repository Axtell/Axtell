import Template from '~/template/Template';
import ConstraintStateTemplate, { ConstraintState } from '~/template/Form/ConstraintStateTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import SVG from '~/models/Request/SVG';
import Theme from '~/models/Theme';
import Random from '~/modern/Random';

import tippy from 'tippy.js/dist/tippy.all.min.js';

export default class LabelGroup extends Template {
    /**
     * A group of label and the input
     * @param {string} label -
     * @param {TextInputTemplate} input
     * @param {?string} o.tooltip Some info describing what
     * @param {?ButtonTemplate} o.button - Pass if you want to keep a button within label group for alignment purposes
     * @param {FormConstraint} [o.liveConstraint=null] - Contraints already setup to show
     * @param {?ForeignInteractor} [o.interactor=null] - Foreign interactor to link `{ foreignInteractor: ForeignInteractor, label: String }`
     * @param {boolean} [o.hideLabel=false] - If label should be hidden
     */
    constructor(label, input, {
        tooltip = "",
        button = null,
        liveConstraint = null,
        interactor = null,
        hideLabel = false
    } = {}) {
        const normalizedLabel = label.toLowerCase().replace(/[^a-z]/g, '');
        const id = `lg-${normalizedLabel}-${Random.ofLength(16)}`;
        const tooltipPlaceholder = <span class="label-group__tooltip" title={tooltip}></span>

        const interactorNode = interactor ? (
            <span class="preview-wrap"><a href={ interactor.foreignInteractor.link } target="_blank">{ interactor.label }</a></span>
        ) : <DocumentFragment/>;

        const root = (
            <div class="item-wrap label-group label-group--style-clean">
                { !hideLabel ? <label for={id}>{ label }{" "}{ tooltipPlaceholder }{ interactorNode }</label> : <DocumentFragment/>  }
            </div>
        );

        super(root);

        // Input element
        const elem = input.loadInContext(root);
        elem.id = id;

        /** @type {ActionControllerDelegate} */
        this.validationDelegate = new ActionControllerDelegate();

        const inputTarget = elem instanceof HTMLInputElement ? elem : input.input;

        // Live constraints
        this._constraints = [];
        if (liveConstraint) {
            liveConstraint._elem = inputTarget;

            for (const sourceValidator of liveConstraint._validators) {
                const template = new ConstraintStateTemplate(sourceValidator.error);
                template.loadInContext(root);

                this._constraints.push({
                    constraintValidator: sourceValidator,
                    template: template
                });
            }

            this._liveConstraint = liveConstraint;

            inputTarget.addEventListener('input', () => {
                this.validate();
            });

        }

        // Load button
        button?.loadInContext(root);

        this._tooltipPlaceholder = tooltipPlaceholder;

        if (tooltip) {
            this.setTooltip(tooltip)
                .catch(HandleUnhandledPromise);
        }

        /** @type {TextInputTemplate} */
        this.input = input;

        this.defineLinkedClass('padTop', 'item-wrap--pad-top');
        this.defineLinkedClass('padHorizontal', '!item-wrap--nopad-horizontal');
    }

    get value() { return this.input.input.value; }
    set value(newValue) {
        this.input.input.value = newValue;
        this.validate();
    }

    /**
     * Validates the LabelGroup for live labels
     */
    validate() {
        const erroredConstraints = this._liveConstraint
            .validate()
            .map(error => error.sourceValidator);

        for (const { template, constraintValidator } of this._constraints) {
            if (erroredConstraints.includes(constraintValidator)) {
                template.state = ConstraintState.Error;
            } else {
                template.state = ConstraintState.Done;
            }
        }

        this.validationDelegate.didSetStateTo(this, erroredConstraints.length === 0);
    }

    /**
     * Foreign synchronizes
     * @param {ForeignInteractor} interactor
     * @param {string} key
     * @param {number} time - delay in the queue see repsective interactor fn
     */
    foreignSynchronize(interactor, key, time = 70) {
        this.input.input.addEventListener('input', (event) => {
            interactor.queueKey(key, time, this.input.value);
        });
    }

    /**
     * Sets the tooltip text
     * @param {string} tooltip
     */
    async setTooltip(tooltip) {
        this._tooltipPlaceholder.title = tooltip;
        this._tooltipPlaceholder.appendChild(
            await SVG.load('info')
        );
        tippy.one(this._tooltipPlaceholder, {
            arrow: true,
            animateFill: false,
            duration: [150, 250],
            size: 'small'
        });
    }
}
