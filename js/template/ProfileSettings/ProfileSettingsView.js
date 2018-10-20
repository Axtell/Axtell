import Template from '~/template/Template';
import HeaderTemplate from '~/template/HeaderTemplate';

/**
 * A setting view
 */
export default class ProfileSettingsView extends Template {
    /**
     * Receives a root and data.
     * @param {Object} data data from the main template
     * @param {HTMLElement} root
     * @param {Object} opts options for header
     * @param {?ButtonTemplate} opts.button a button to put in header
     */
    constructor(data, root, { button } = {}) {
        const viewWrapper = <div/>;
        super(viewWrapper);

        /** @type {User} */
        this.user = data.user;

        /** @type {ProfileSettingsTemplate} */
        this.rootTemplate = data.root;

        /** @type {string} */
        this.title = data.itemName;

        /** @type {string} */
        this.subtitle = data.subtitle;

        /** @type {string} */
        this.section = data.sectionName;

        new HeaderTemplate(this.title, {
            level: 2,
            subtitle: this.subtitle,
            button: button
        }).loadInContext(viewWrapper);

        viewWrapper.appendChild(root);
    }
}
