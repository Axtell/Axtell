import HeaderViewController from '~/controllers/HeaderViewController';
import SwappingViewController from '~/controllers/SwappingViewController';
import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

const root = document.getElementById("post-write");
if (root) {
    const rootView = new SwappingViewController(root);

    // Load the view
    import('~/template/WritePost/WritePostTemplate').then(async ({ default: WritePostTemplate }) => {

        const writePostTemplate = new WritePostTemplate();
        rootView.displayAlternate(writePostTemplate);

    }).catch(HandleUnhandledPromise);
}
