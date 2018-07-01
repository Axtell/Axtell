import Template from '~/template/Template';
import LabelGroup from '~/template/Form/LabelGroup';
import HeaderTemplate from '~/template/HeaderTemplate';
import MarkdownTemplate from '~/template/MarkdownTemplate';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';

export default class WritePostTabWritePost extends Template {
    constructor() {
        const root = <div/>;
        super(root);

        root.appendChild(
            <DocumentFragment>
                { new HeaderTemplate('Write Post').unique() }

                {this.defineLinkedTemplate(
                    'title',
                    new LabelGroup(
                        'Title',
                        new TextInputTemplate(
                            TextInputType.Title,
                            'Post title'
                        ),
                        'A simple and descriptive title of your challenge.'
                    )
                )}

                {this.defineLinkedTemplate(
                    'postBody',
                    new LabelGroup(
                        'Post Body',
                        new MarkdownTemplate(),
                        'Describe your challenge and be specific. (markdown supported)'
                    )
                )}
            </DocumentFragment>
        );
    }
}
