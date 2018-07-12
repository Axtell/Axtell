import Template from '~/template/Template';
import HeaderTemplate from '~/template/HeaderTemplate';
import { ButtonColor } from '~/template/ButtonTemplate';
import SwappingTemplate from '~/template/SwappingTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

import * as PreviewKey from '~/helpers/PreviewKey';
import LoadingIcon from '~/svg/LoadingIcon';

export const NO_TITLE = do {
    const header = new HeaderTemplate('No Title.')
    header.isDimmed = true;
    header
};

export const NO_BODY = (
    <div class="preview-no-body">
        <svg namespace="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path namespace="http://www.w3.org/2000/svg" d="M 4 2 L 4 11 L 2 11 L 2 12.5 C 2 13.328 2.672 14 3.5 14 L 11.5 14 C 11.909962 14 12.301599 13.855814 12.578125 13.580078 C 12.854651 13.304342 13 12.912335 13 12.5 L 13 2 L 4 2 z M 5 3 L 12 3 L 12 12.5 C 12 12.690665 11.94482 12.79758 11.871094 12.871094 C 11.79737 12.944607 11.689038 13 11.5 13 C 11.172 13 11 12.686 11 12.375 L 11 11 L 5 11 L 5 3 z" />
        </svg>
        <h3>Live Post Preview</h3>
        <span>Preview will be automatically refreshed as you type.</span>
    </div>
);

export default class WritePostTabSubmit extends Template {
    /**
     * Creates in context
     * @param {WritePostTemplate} writePostTemplate
     */
    constructor(writePostTemplate) {
        super(<div/>);

        /** @type {ButtonTemplate} */
        this.submitButton = new ProgressButtonTemplate({
            text: 'Submit',
            color: ButtonColor.green,
        });

        this.submitButton.isWide = true;
        this.submitButton.hasPaddedTop = true;
        this.submitButton.hasPaddedHorizontal = true;

        /** @type {WritePostTemplate} */
        this.writePostTemplate = writePostTemplate;

        /** @type {SwappingTemplate} */
        this.previewSwapper = new SwappingTemplate();

        this.underlyingNode.appendChild(
            <DocumentFragment>
                { new HeaderTemplate('Submit.', { subtitle: 'Preview your post and prepare it for submission.' }).unique() }
                { new HeaderTemplate('Final Preview', { level: 3 }).unique() }
                <div class="content-offset content-offset--pad-horizontal">
                    { this.previewSwapper.unique() }
                </div>
                { this.submitButton.unique() }
            </DocumentFragment>
        );

        this.submitButton.delegate.didSetStateTo = async (button, _) => {
            await this.submit();
        };

        this.writePostTemplate.foreignChildInteractor.watchTick(() => {
            this.submitButton.setIsDisabled(!writePostTemplate.isComplete, 'Complete all fields correctly.');
        });
    }

    /** @override */
    willLoad() {
        this.submitButton.setIsDisabled(!this.writePostTemplate.isComplete, 'Complete all fields correctly.');
    }

    /** @override */
    didLoad() {
        this.previewSwapper.controller.displayAlternate(new Template(
            <div class="template--root">
                { LoadingIcon.cloneNode(true) }
                <h3>Loading...</h3>
            </div>
        ));

        this.loadPreview()
            .catch(HandleUnhandledPromise);
    }

    /** @private */
    async submit() {
        const request = this.writePostTemplate.postRequest;
        const postUrl = await request.run();
        window.location.href = postUrl;
    }

    /** @private */
    async loadPreview() {
        const markdown = await import('#/markdown-renderer');

        const header = new HeaderTemplate('Untitled', {});
        const body = new SwappingTemplate(NO_BODY);

        this.previewSwapper.controller.displayAlternate(new Template(
            <div>
                { header.unique() }
                { body.unique() }
            </div>
        ));

        this.writePostTemplate.foreignChildInteractor.watch(PreviewKey.Title, (newTitle) => {
            if (newTitle) {
                header.title = newTitle;
                header.isDimmed = false;
            } else {
                header.title = 'No Title.';
                header.isDimmed = true;
            }
        });

        this.writePostTemplate.foreignChildInteractor.watch(PreviewKey.Body, (newBody) => {
            if (newBody) body.controller.displayAlternate(
                Template.fromInnerHTML(<div class="main body"/>, markdown.render(newBody)));
            else body.controller.restoreOriginal();
        });
    }
}
