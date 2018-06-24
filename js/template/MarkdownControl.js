import Template, { TemplateType } from '~/template/Template';
import Random from '~/modern/Random';
import Theme from '~/models/Theme';

import tippy from 'tippy.js/dist/tippy.all.min.js';

/**
 * Represents a control for the markdown controls list. Stores all the
 * information and a callback for the action.
 */
export default class MarkdownControl extends Template {
    /**
     * @param  {string}   name     Name of control
     * @param  {string}   key      Name of key to trigger keyboard shortcut.
     * @param  {string}   iconName Icon name (/static/img/$.svg)
     * @param  {Function} callback Passed the markdown control instance.
     */
    constructor(name, key, iconName, callback) {
        const id = `markdown__mc--${iconName}-${Random.ofLength(8)}`;
        const root = (
            <a title={name} id={ id }><img alt={name} src={Theme.current.imageForTheme(iconName)}/></a>
        );

        tippy(root, {
            size: 'small',
            animation: 'scale',
            duration: [200, 150]
        });

        super(root);

        this._name = name;
        this._keyName = key;
        this._iconName = iconName;
        this._callback = callback;
        this._controller = null;

        root.addEventListener('click', () => {
            this.trigger();
        });
    }

    /**
     * Calls
     */
    trigger() {
        this._callback(this._controller);
    }

    /**
     * Sets the controlling template.
     *
     * @param {MarkdownControlsTemplate} template - controlling template
     */
    setControllingTemplate(template) {
        this._controller = template;
    }
}

export function MarkdownControlBuilder(name, key, iconName, callback) {
    return class extends MarkdownControl {
        constructor() {
            super(name, key, iconName, callback);
        }
    }
}
