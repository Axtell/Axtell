import Template from '~/template/Template';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import SVG from '~/models/Request/SVG';
import Theme from '~/models/Theme';
import Random from '~/modern/Random';

import tippy from 'tippy.js/dist/tippy.all.min.js';

export default class LabelGroup extends Template {
    /**
     * A group of label and the input
     * @param {string} label
     * @param {TextInputTemplate} input
     * @param {?string} tooltip Some info describing what
     */
    constructor(label, input, tooltip = "") {
        const id = Random.ofLength(16);
        const tooltipPlaceholder = <span class="label-group__tooltip" title={tooltip}></span>

        const root = (
            <div class="item-wrap label-group label-group--style-clean">
                <label for={id}>{ label }{" "}{ tooltipPlaceholder }</label>
            </div>
        );

        super(root);

        const elem = input.loadInContext(root);
        elem.id = id;

        this._tooltipPlaceholder = tooltipPlaceholder;

        if (tooltip) {
            this.setTooltip(tooltip)
                .catch(HandleUnhandledPromise);
        }

        /** @type {TextInputTemplate} */
        this.input = input;


        this.defineLinkedInput('value', elem);

        this.defineLinkedClass('padTop', 'item-wrap--pad-top');
        this.defineLinkedClass('!padHorizontal', 'item-wrap--nopad-horizontal');
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
