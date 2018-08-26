import { HandleUnhandledPromise } from '~/helpers/ErrorManager';

const OPEN_SEARCH_NODE = document.getElementById('open-search');

if (OPEN_SEARCH_NODE) {
    OPEN_SEARCH_NODE.addEventListener('click', () => {
        import('~/controllers/SearchViewController')
            .then(({ default: SearchController }) =>
                SearchController.shared.present())
            .catch(HandleUnhandledPromise);
    });
}
