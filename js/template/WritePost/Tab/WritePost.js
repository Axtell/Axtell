import Template from '~/template/Template';
import LabelGroup from '~/template/Form/LabelGroup';
import HeaderTemplate from '~/template/HeaderTemplate';
import MarkdownTemplate from '~/template/MarkdownTemplate';
import TextInputTemplate, { TextInputType } from '~/template/Form/TextInputTemplate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import FormConstraint from '~/controllers/Form/FormConstraint';

import * as PreviewKey from '~/helpers/PreviewKey';
import * as PostInfo from '~/models/Post';

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

        const title = new LabelGroup(
            'Title',
            this.title,
            {
                tooltip: 'A simple and descriptive title of your challenge.',
                liveConstraint: new FormConstraint()
                    .length(PostInfo.MIN_TITLE_LENGTH, PostInfo.MAX_TITLE_LENGTH)
            }
        );


        const body = new LabelGroup(
            'Post Body',
            this.postBody,
            {
                tooltip: 'Describe your challenge and be specific. (markdown supported)',
                liveConstraint: new FormConstraint()
                    .length(PostInfo.MIN_BODY_LENGTH, PostInfo.MAX_BODY_LENGTH),
                interactor: {
                    foreignInteractor: writePostTemplate.foreignInteractor,
                    label: 'Preview'
                }
            }
        );

        title.foreignSynchronize(writePostTemplate.foreignInteractor, PreviewKey.Title);
        body.foreignSynchronize(writePostTemplate.foreignInteractor, PreviewKey.Body);

        writePostTemplate.postTitleChecklistItem.bindLabelGroup(title);
        writePostTemplate.postBodyChecklistItem.bindLabelGroup(body);

        root.appendChild(
            <DocumentFragment>
                { new HeaderTemplate('Write Post.').unique() }

                { title.unique() }
                { body.unique() }

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
