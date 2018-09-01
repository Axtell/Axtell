import Template from '~/template/Template';
import ConstraintStateTemplate, { ConstraintState } from '~/template/Form/ConstraintStateTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import SVG from '~/models/Request/SVG';
import Theme from '~/models/Theme';
import Random from '~/modern/Random';

import { merge, fromEvent } from 'rxjs';
import { share, map, distinctUntilChanged } from 'rxjs/operators';

import tippy from 'tippy.js/dist/tippy.all.min.js';

export default class LabelGroup extends Template {
    /**
     * A group of label and the input.
     *
     * If you do supply a template. Ensure it has `.input` attribute which
     * evaluates to the underling HTMLInputElement which can be observed for
     * value updates. See {@link InputInterface}
     *
     * @param {string} label - The label (self-explantory)
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

        /** @type {ActionControllerDelegate} */
        this.validationDelegate = new ActionControllerDelegate();

        const valueInputTarget = input.input;
        const userInputTarget = input.userInput;

        if (userInputTarget) {
            userInputTarget.id = id;
        }

        // Observes value change
        this._observeValue = merge(
            fromEvent(valueInputTarget, 'input')
                .pipe(map(event => event.target.value)),
            fromEvent(valueInputTarget, 'change')
                .pipe(map(event => event.target.value)))
            .pipe(
                share());

        // Live constraints
        this._constraints = [];
        if (liveConstraint) {
            liveConstraint._elem = valueInputTarget;

            for (const sourceValidator of liveConstraint._validators) {
                const template = new ConstraintStateTemplate(sourceValidator.error);
                template.loadInContext(root);

                this._constraints.push({
                    constraintValidator: sourceValidator,
                    template: template
                });
            }

            this._observeValidation = this._observeValue
                .pipe(
                    distinctUntilChanged(),
                    map(() => liveConstraint.validate()),
                    share());

            this._observeValidation
                .subscribe(
                    errors => this.validate(errors))
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

    /**
     * Returns observer for the value.
     * @return {Observable}
     */
    observeValue() {
        return this._observeValue;
    }

    /**
     * Observe the validation status. This provides list of errors
     * @return {Observable}
     */
    observeValidation() {
        return this._observeValidation;
    }

    /**
     * Sets the value of the underlying input value if applicable. Gives no
     * guarantee of the sync with UI.
     * @type {any}
     */
    get value() { return this.input.input.value; }

    /**
     * Sets the value of the type. USE of this setter is NOT reccomended.
     * @param {any} newValue
     */
    set value(newValue) {
        this.input.input.value = newValue;
    }

    /**
     * Validates the LabelGroup for live labels
     * @param {ValidationError[]} errors
     */
    validate(errors) {
        const erroredConstraints = errors
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
