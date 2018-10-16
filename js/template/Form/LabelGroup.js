import Template from '~/template/Template';
import ConstraintStateTemplate, { ConstraintState } from '~/template/Form/ConstraintStateTemplate';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import SVG from '~/models/Request/SVG';
import Theme from '~/models/Theme';
import Random from '~/modern/Random';

import { of } from 'rxjs';
import { tap, shareReplay, share, skip, map, distinctUntilChanged } from 'rxjs/operators';

import tippy from 'tippy.js/dist/tippy.all.min.js';

/**
 * A label group is an input along with surrounding metadata. This means this
 * manages validation, interaction, labels, and more. This also allows you to
 * configure tooltips.
 *
 * The label group can mount any item that implements the {@link InputInterface}
 * interface.
 */
export default class LabelGroup extends Template {
    /**
     * A group of label and the input.
     *
     * If you do supply a template. Ensure it has `.input` attribute which
     * evaluates to the underling HTMLInputElement which can be observed for
     * value updates. See {@link InputInterface}
     *
     * @param {string} label - The label (self-explantory)
     * @param {InputInterface} input - The input to mount
     * @param {Object} o - additional options.
     * @param {?string} o.tooltip Some info describing what
     * @param {?ButtonTemplate} o.button - Pass if you want to keep a button within label group for alignment purposes
     * @param {FormConstraint} [o.liveConstraint=null] - Contraints already setup to show
     * @param {?ForeignInteractor} [o.interactor=null] - Foreign interactor to link `{ foreignInteractor: ForeignInteractor, label: String }`
     * @param {boolean} [o.hideLabel=false] - If label should be hidden.
     * @param {?number} [o.weight=null] - If in group how much weight (default is one)
     */
    constructor(label, input, {
        tooltip = "",
        button = null,
        liveConstraint = null,
        interactor = null,
        hideLabel = false,
        weight = null
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

        const userInputTarget = input.userInput;
        if (userInputTarget) {
            userInputTarget.id = id;
        }

        // Observes value change
        this._observeValue = input.observeValue();

        // Live constraints
        this._constraints = [];
        if (liveConstraint) {
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
                    map(value => liveConstraint.validate(value)),
                    shareReplay());

            this._observeValidation
                .pipe(
                    skip(1))
                .subscribe(
                    errors => this.validate(errors))
        } else {
            this._observeValidation = of([])
        }

        // Load button
        button?.loadInContext(root);

        this._tooltipPlaceholder = tooltipPlaceholder;

        if (tooltip) {
            this.setTooltip(tooltip)
                .catch(HandleUnhandledPromise);
        }

        if (weight !== null) {
            this.weight = weight;
        }

        /** @type {TextInputTemplate} */
        this.input = input;

        this.defineLinkedClass('padTop', 'item-wrap--pad-top');
        this.defineLinkedClass('padHorizontal', '!item-wrap--nopad-horizontal');
    }

    /**
     * Sets the weight in a group
     * @type {number}
     */
    set weight(newWeight) {
        this.underlyingNode.style.flex = `${newWeight}`;
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
    get value() { return this.input.userInput.value; }

    /**
     * Sets the value of the type. USE of this setter is NOT reccomended.
     * @param {any} newValue
     */
    set value(newValue) {
        this.input.userInput.value = newValue;
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
        this.input.userInput.addEventListener('input', (event) => {
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
