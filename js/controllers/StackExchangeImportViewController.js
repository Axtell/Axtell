import ProgressButtonController from '~/controllers/ProgressButtonController';
import ViewController from '~/controllers/ViewController';
import ErrorManager from '~/helpers/ErrorManager';
import Normalize from '~/models/Normalize';
import Query from '~/models/Query';
import Theme from '~/models/Theme';
import Post from '~/models/Request/Post';

import removeMarkdown from 'remove-markdown';
import entities from 'entities';

function styleName(name) {
    return `create-post__StackExchangeImport__${name}`;
}

/**
 * Imports from Stack Exchange
 */
export default class StackExchangeImporterViewController extends ViewController {
    /**
     * The instance container. Also takes in a Stack Exchange instance
     * @param {HTMLElement} container
     * @param {StackExchange} stackExchange Must be auth'd
     */
    constructor(container, stackExchange) {
        super(container);

        /** @type {HTMLElement} */
        this.container = container;

        /** @type {StackExchange} */
        this.stackExchange = stackExchange;

        /** @type {Object} */
        this.questions = [];

        /** @type {?HTMLElement} */
        this.questionList = null;

        /** @type {Query} */
        this.query = null;

        /** @type {ProgressButtonController} */
        this.importButton = null;

        /** @type {Object} */
        this.selectedQuestion = null;

        this.initialize()
            .catch(ErrorManager.unhandled);
    }

    async initialize() {
        this.setLoading();
        const posts = await this.stackExchange.getQuestions();
        this.questions = posts;

        // Generate query
        this.query = new Query(
            posts,
            post => post.title
        );

        this.setClear();
        this.container.appendChild(
            <div class={`body ${styleName('instruction')}`}>Select the post you would like to import</div>
        );

        // Generate search box
        const search = (
            <input type="text" class="text-input text-input--size-wide text-input--type-search text-input--pad-top" placeholder="Search..." />
        );
        search.addEventListener('input', () => {
            this.setSearchFilter(search.value);
        });
        this.container.appendChild(search);

        this.questionList = <div class={styleName('scrollBox')}></div>
        this.showQuestions(posts);

        this.container.appendChild(this.questionList);

        // Add the upload button
        const importButton = (
            <div class="button button--color-accent button--size-wide button--align-center">
                <img src={ Theme.dark.imageForTheme('import') } />
                <span>Import</span>
            </div>
        );
        this.importButton = new ProgressButtonController(importButton);
        importButton.addEventListener('click', ::this.import);
        this.container.appendChild(importButton);

        // We don't want the size of the window to keep changing
        this.container.style.width = window.getComputedStyle(this.container).width;
        this.container.style.height = window.getComputedStyle(this.container).height;
    }

    _importing = false;
    /**
     * Runs the import
     */
    async import() {
        if (this._importing) return;
        this.importing = true;

        // Find selected question
        if (!this.selectedQuestion) {
            alert('You must select a question to import');
            this.importing = false;
            return;
        }

        const post = new Post({
            title: this.selectedQuestion.title,
            body: this.selectedQuestion.body_markdown
        });

        const redirectUrl = await post.run();
        window.location.href = redirectUrl;

        this.importing = false;
    }

    /**
     * Sets if importing or not
     * @param {boolean} value if importing
     */
    set importing(value) {
        this._importing = value;
        this.importButton.setLoadingState(value);
    }

    // Search logic
    _lastFilter = null;

    /**
     * Sets the filter on the search to a value
     * @param {string} value Empty value means all
     */
    setSearchFilter(value) {
        if (this._lastFilter) clearTimeout(this._lastFilter);
        this._lastFilter = setTimeout(() => {
            this._lastFilter = null;

            if (value) {
                this.showQuestions(this.query.find(value));
            } else {
                this.showQuestions(this.questions);
            }
        }, 50);
    }

    /**
     * Clears all questions
     */
    clearQuestions() {
        while(this.questionList.firstChild) {
            this.questionList.removeChild(this.questionList.firstChild);
        }
    }

    /**
     * Shows the questions
     * @param {Object[]} posts - The questinos to show
     */
    showQuestions(posts) {
        this.clearQuestions();

        const fragment = document.createDocumentFragment();
        posts.map(post => {
            fragment.appendChild(this.createOptionFor(post));
        });

        this.questionList.appendChild(fragment);
    }

    /**
     * Creates an <option> from an SE API Question object
     * @param {Object} question from SE API
     */
    createOptionFor(question) {
        const itemId = styleName(`question_${question.question_id}`);
        const itemLabel = `${itemId}__label`;

        const title = entities.decodeHTML(question.title);
        const bodyPreview = removeMarkdown(entities.decodeHTML(question.body_markdown)).substring(0, 80);

        const input = (
            <input
                type="radio" name={styleName('radio')} class={styleName('radio')} id={itemId}
                data-qid={question.question_id} aria-describedby={itemLabel} />
        );

        input.addEventListener('change', () => {
            if (input.checked) {
                this.selectedQuestion = question;
            }
        });

        return (
            <div class={styleName('question')}>
                { input }
                <label for={itemId} id={itemLabel} class={styleName('question__overview')}>
                    <h4 class={styleName('question__title')}>{ title }</h4>
                    <span class={styleName('question__desc')}>{ bodyPreview }...</span>
                </label>
                <a href={ question.link } class={styleName('link')} target="_blank" rel="external nofollow">
                    <img class={styleName('link__icon')} src={ Theme.current.imageForTheme('external-link') } />
                </a>
            </div>
        );
    }

    /**
     * Clears all elements
     */
    setClear() {
        while(this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    /**
     * Sets this to the loading state
     */
    setLoading() {
        this.setClear();
        this.container.appendChild(
            <img class={styleName('loading')} src={Theme.current.imageForTheme('loading')} />
        );
    }

}
