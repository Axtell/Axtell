import Template from '~/template/Template';
import WritePostNavigationItemTemplate from '~/template/WritePost/WritePostNavigationItemTemplate';
import WritePostSubheaderTemplate from '~/template/WritePost/WritePostSubheaderTemplate';
import HeaderViewController from '~/controllers/HeaderViewController';
import SwappingTemplate from '~/template/SwappingTemplate';
import ErrorManager from '~/helpers/ErrorManager';

import WritePostTabWritePost from '~/template/WritePost/Tab/WritePost';

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

        /**
         * The write post view
         * @type {Object}
         */
        this.tabs = {
            [WritePostTab.WritePost]: new WritePostTabWritePost(this)
        }

        /** @type {WritePostSubheaderTemplate} */
        this.subheader = new WritePostSubheaderTemplate();
    }

    /** @type {WritePostTab} */
    set tab(tab) {
        const tabTemplate = this.tabs[tab];

        if (!tabTemplate) {
            ErrorManager.warn(`Attempted to open unknown tab type of ${tab.toString()}`, UnknownTab);
            return;
        }

        this.swapper.controller.displayAlternate(tabTemplate);
    }

    /** @override */
    didLoad() {
        this.subheader.appendNavigationItem(
            new WritePostNavigationItemTemplate(
                'Write Post',
                'write post body',
                WritePostTab.WritePost
            ),
            true
        );

        this.subheader.appendNavigationItem(
            new WritePostNavigationItemTemplate(
                'Examples',
                'write test cases for solutions',
                WritePostTab.Examples
            )
        );

        this.subheader.appendNavigationItem(
            new WritePostNavigationItemTemplate(
                'Submit',
                'preview before submitting',
                WritePostTab.Submit
            )
        );

        this.subheader.delegate.shouldOpen = (template, id) => {
            this.tab = id;
        };

        HeaderViewController.shared.addSubheader(this.subheader);
    }
}
