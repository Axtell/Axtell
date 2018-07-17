import WritePostNavigationItemTemplate from '~/template/WritePost/WritePostNavigationItemTemplate';
import WritePostSubheaderTemplate from '~/template/WritePost/WritePostSubheaderTemplate';
import ForeignChildInteractor from '~/interactors/ForeignChildInteractor';
import HeaderViewController from '~/controllers/HeaderViewController';
import ForeignInteractor from '~/interactors/ForeignInteractor';
import SwappingTemplate from '~/template/SwappingTemplate';
import PublishPost from '~/models/Request/Post';
import ErrorManager from '~/helpers/ErrorManager';
import Template from '~/template/Template';

import WritePostTabWritePost from '~/template/WritePost/Tab/WritePost';
import WritePostTabExamples from '~/template/WritePost/Tab/Examples';
import WritePostTabSubmit from '~/template/WritePost/Tab/Submit';

import WritePostTabChecklist, { WritePostTabChecklistItem } from '~/template/WritePost/WritePostTabChecklist';

export const WritePostTab = {
    WritePost: Symbol('WritePost.Tab.WritePost'),
    Examples: Symbol('WritePost.Tab.Examples'),
    Submit: Symbol('WritePost.Tab.Submit')
};

export const UnknownTab = Symbol('WritePost.Error.UnknownTab');

export default class WritePostTemplate extends Template {
    /**
     * Creates
     */
    constructor() {
        const swapper = new SwappingTemplate();
        super(swapper);

        /** @type {SwappingTemplate} */
        this.swapper = swapper;

        // The check items
        this.postTitleChecklistItem = new WritePostTabChecklistItem('Post title');
        this.postBodyChecklistItem = new WritePostTabChecklistItem('Post body');

        /** @type {WritePostSubheaderTemplate} */
        this.subheader = new WritePostSubheaderTemplate();

        /** @type {ForeignInteractor} */
        this.foreignInteractor = new ForeignInteractor('/post/preview');

        /** @type {ForeignChildInteractor} */
        this.foreignChildInteractor = new ForeignChildInteractor(this.foreignInteractor.id);

        /**
         * The write post view
         * @type {Object}
         */
        this.tabs = {
            [WritePostTab.WritePost]: new WritePostTabWritePost(this),
            [WritePostTab.Examples]: new WritePostTabExamples(this),
            [WritePostTab.Submit]: new WritePostTabSubmit(this)
        };
    }

    /** @type {Post} */
    get postRequest() {
        return new PublishPost({
            title: this.tabs[WritePostTab.WritePost].title.value,
            body: this.tabs[WritePostTab.WritePost].postBody.value
        });
    }

    /**
     * If fully complete and valid
     * @type {boolean}
     */
    get isComplete() {
        return this.subheader.allTabs.every(tab => tab.checklist.isComplete);
    }

    /** @type {WritePostTab} */
    set tab(tab) {
        const tabTemplate = this.tabs[tab];

        if (!tabTemplate) {
            ErrorManager.warn(`Attempted to open unknown tab type of ${tab.toString()}`, UnknownTab);
            return;
        }

        const tabNode = this.swapper.controller.displayAlternate(tabTemplate);
        tabNode.parentTemplate = this;
    }

    /** @override */
    didLoad() {
        this.subheader.appendNavigationItem(
            new WritePostNavigationItemTemplate(
                'Write Post',
                new WritePostTabChecklist([
                    this.postTitleChecklistItem,
                    this.postBodyChecklistItem
                ]),
                WritePostTab.WritePost
            ),
            true
        );

        this.subheader.appendNavigationItem(
            new WritePostNavigationItemTemplate(
                'Submit',
                new WritePostTabChecklist([]),
                WritePostTab.Submit
            )
        );

        this.subheader.delegate.shouldOpen = (template, id) => {
            this.tab = id;
        };

        HeaderViewController.shared.addSubheader(this.subheader);
    }
}
