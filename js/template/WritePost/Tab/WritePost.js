import Template from '~/template/Template';
import LabelGroup from '~/template/Form/LabelGroup';
import HeaderTemplate from '~/template/HeaderTemplate';
import MarkdownTemplate from '~/template/MarkdownTemplate';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';

export default class WritePostTabWritePost extends Template {
    /**
     * Creates in context
     * @param {WritePostTemplate} writePostTemplate
     */
    constructor(writePostTemplate) {
        const root = <div/>;
        super(root);

        /** @type {MarkdownTemplate} */
        this.postBody = new MarkdownTemplate();
        this.postBody.autoresize = true;

        /** @type {TextInputTemplate} */
        this.title = new TextInputTemplate(
            TextInputType.Title,
            'Post title'
        );

        /** @type {ButtonTemplate} */
        this.nextTab = new ButtonTemplate({
            text: 'Next Step',
            color: ButtonColor.blue
        });
        this.nextTab.isWide = true;
        this.nextTab.hasPaddedHorizontal = true;

        root.appendChild(
            <DocumentFragment>
                { new HeaderTemplate('Write Post').unique() }

                { new LabelGroup(
                    'Title',
                    this.title,
                    { tooltip: 'A simple and descriptive title of your challenge.' }
                ).unique() }

                {new LabelGroup(
                    'Post Body',
                    this.postBody,
                    { tooltip: 'Describe your challenge and be specific. (markdown supported)' }
                ).unique()}

                { this.nextTab.unique() }
            </DocumentFragment>
        );

        /** @type {WritePostTemplate} */
        this.writePostTemplate = writePostTemplate;

        this.nextTab.delegate.didSetStateTo = (template, state) => {
            this.writePostTemplate.subheader.nextTab();
        };

    }
}
