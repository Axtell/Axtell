import FullScreenModalTemplate from '~/template/FullScreenModalTemplate';
import ButtonTemplate, { ButtonColor } from '~/template/ButtonTemplate';
import ProgressButtonTemplate from '~/template/ProgressButtonTemplate';
import LoadingTemplate from '~/template/LoadingTemplate';
import Analytics, { EventType } from '~/models/Analytics';
import LabelGroup from '~/template/Form/LabelGroup';
import LanguageInputTemplate from '~/template/Form/LanguageInputTemplate';
import FormConstraint from '~/controllers/Form/FormConstraint';

import { combineLatest } from 'rxjs';

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
         */
        this.languageInput = new LabelGroup(
            'Language',
            new LanguageInputTemplate(),
            {
                liveConstraint: new FormConstraint()
                    .notEmpty('Choose a language')
            }
        );
    }

    async didInitialLoad() {
        await super.didInitialLoad();

        // Load the view
        this.root.displayAlternate(
            <div>
                { this.languageInput.unique() }
            </div>
        );
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
