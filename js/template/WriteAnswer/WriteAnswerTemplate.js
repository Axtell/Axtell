import FullScreenModalTemplate from '~/template/FullScreenModalTemplate';
import ButtonTemplate, { ButtonColor, ButtonStyle } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import Analytics, { EventType } from '~/models/Analytics';
import LabelGroup from '~/template/Form/LabelGroup';
import LanguageInputTemplate from '~/template/Form/LanguageInputTemplate';
import CodeEditorTemplate from '~/template/CodeEditorTemplate';
import MarkdownTemplate from '~/template/MarkdownTemplate';
import FormConstraint from '~/controllers/Form/FormConstraint';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import Language from '~/models/Language';
import Answer from '~/models/Request/Answer';
import Theme from '~/models/Theme';

import { merge, combineLatest } from 'rxjs';
import { filter, first, map, share, startWith, withLatestFrom } from 'rxjs/operators';

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
            body: root.unique(),
            icon: <img src={Theme.dark.imageForTheme('answer')}/>,
            submitButton: new ProgressButtonTemplate({
                text: 'Submit',
                color: ButtonColor.activeAxtell,
                style: ButtonStyle.plain
            })
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
         * Commentary field
         * @type {MarkdownTemplate}
         */
        this.commentary = new MarkdownTemplate({
            placeholder: 'Commentary',
            autoResize: true
        })

        /**
         * The validation observable. Only available after load
         * @type {?Observable}
         */
        this.observeValidation = null;

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
                this.commentary
            )
        ];

        // Load the view
        this.root.displayAlternate(
            <div>
                { labels.map(label => label.unique()) }
            </div>
        );

        // Update syntax when language changes
        this.languageInput
            .observeValue()
            .subscribe(
                language =>
                    this.codeEditor
                        .controller
                        .setLanguage(language)
                        .catch(HandleUnhandledPromise));

        // Observe validation of all fields
        this.observeValidation = combineLatest(
            labels.map(
                label => label.observeValidation()),
            // Combine is of all errors into one big error array
            (...errors) => [].concat(...errors))
            .pipe(
                // If they are no errors then that means we're good
                map(errors => errors.length === 0),
                startWith(false),
                share());

        // Disable submission button when not validated.
        this.observeValidation
            .subscribe(
                isComplete => this.submitButton.setIsDisabled(
                    !isComplete,
                    `Complete all required fields.`))

        // Handles submit click
        this.submitButton
            // When we click the submit button...
            .observeClick()
            .pipe(
                // Grab the latest values
                withLatestFrom(
                    // Of t he following items
                    combineLatest(
                        this.languageInput
                            .observeValue(),
                        this.codeEditor
                            .observeValue(),
                        this.commentary
                            .observeValue()),
                    // Ignore the click data
                    (click, data) => data),
                // Create an object from data
                map(([language, code, commentary]) => ({ language, code, commentary })),
                // Only able to submit once
                first())
            .subscribe(({ language, code, commentary }) => {
                this.submitButton.controller.setLoadingState(true);
                (async () => {

                    const answer = new Answer({
                        post: this.post,
                        language: language,
                        code: code,
                        commentary: commentary
                    });

                    const redirectURL = await answer.run();
                    window.location.href = redirectURL;

                })().catch(HandleUnhandledPromise);
            })
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
