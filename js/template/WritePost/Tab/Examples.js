import Template from '~/template/Template';
import HeaderTemplate from '~/template/HeaderTemplate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';

export default class WritePostTabExamples extends Template {
    /**
     * Creates in context
     * @param {WritePostTemplate} writePostTemplate
     */
    constructor(writePostTemplate) {
        const root = <div/>;
        super(root);

        /** @type {ButtonTemplate} */
        this.nextTab = new ButtonTemplate({
            text: 'Next Step',
            color: ButtonColor.blue
        });
        this.nextTab.isWide = true;
        this.nextTab.hasPaddedTop = true;
        this.nextTab.hasPaddedHorizontal = true;

        root.appendChild(
            <DocumentFragment>
                { new HeaderTemplate('Examples', { subtitle: 'Nothing here yet' }).unique() }

                { this.nextTab.unique() }
            </DocumentFragment>
        );
    }
}
