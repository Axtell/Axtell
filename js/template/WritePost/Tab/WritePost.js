import Template from '~/template/Template';
import LabelGroup from '~/template/Form/LabelGroup';
import HeaderTemplate from '~/template/HeaderTemplate';
import MarkdownTemplate from '~/template/MarkdownTemplate';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';

export default class WritePostTabWritePost extends Template {
    constructor() {
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
            </DocumentFragment>
        );
    }
}
