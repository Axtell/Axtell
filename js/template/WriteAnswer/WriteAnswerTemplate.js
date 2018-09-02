import FullScreenModalTemplate from '~/template/FullScreenModalTemplate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import Analytics, { EventType } from '~/models/Analytics';
import LabelGroup from '~/template/Form/LabelGroup';
import LanguageInputTemplate from '~/template/Form/LanguageInputTemplate';
import CodeEditorTemplate from '~/template/CodeEditorTemplate';
import MarkdownTemplate from '~/template/MarkdownTemplate';
import FormConstraint from '~/controllers/Form/FormConstraint';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Instance of {@link FullScreenModalTemplate}
 */
export default class WriteAnswerTemplate extends FullScreenModalTemplate {

    /**
     * @param {Post} post - The post we're writing about
     */
    constructor(post) {
        const root = new LoadingTemplate();

        super({
            title: <span>Answering <strong>{ post.title }</strong></span>,
            body: root.unique()
        });

        /**
         * The body template
         * @type {LoadingTemplate}
         */
        this.root = root;

        /**
         * The post that we're writing on
         * @type {Post}
         */
        this.post = post;

        /**
         * These are the form elements
         * @type {LabelGroup}
         */
        this.languageInput = new LanguageInputTemplate();

        /**
         * The code editor
         * @type {?LabelGroup}
         */
        this.codeEditor = null;
    }

    async didInitialLoad() {
        await super.didInitialLoad();

        this.codeEditor = await new CodeEditorTemplate()


        // Create labels
        const labels = [
            new LabelGroup(
                'Language',
                this.languageInput,
                {
                    liveConstraint: new FormConstraint()
                        .hasValue('Choose a language')
                }
            ),
            new LabelGroup(
                'Code',
                this.codeEditor
            ),
            new LabelGroup(
                'Commentary',
                new MarkdownTemplate({
                    placeholder: 'Commentary',
                    autoResize: true
                })
            )
        ];

        // Load the view
        this.root.displayAlternate(
            <div>
                { labels.map(label => label.unique()) }
            </div>
        );

        this.languageInput
            .observeValue()
            .subscribe(
                language =>
                    this.codeEditor
                        .controller
                        .setLanguage(language)
                        .catch(HandleUnhandledPromise));
    }

    didLoad() {
        super.didLoad();
        Analytics.shared.report(EventType.answerWriteOpen(this.post));
    }

    didUnload() {
        super.didUnload();
        Analytics.shared.report(EventType.answerWriteOpen(this.post));
    }

}
