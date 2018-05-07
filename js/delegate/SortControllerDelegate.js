import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export const SORT_TYPE_KEY = 'st';

/**
 * Manages a select dialog for sorting
 */
export default class SortControllerDelegate extends ActionControllerDelegate {
    didSetStateTo(controller, state) {
        // Sort Type
        let type = state.elem.dataset[SORT_TYPE_KEY];

        if (type) {
            let params = new URLSearchParams(location.search);
            if (params.get(SORT_TYPE_KEY) !== type) {
                params.set(SORT_TYPE_KEY, type)
                history.replaceState({}, "", '?' + params.toString());
            }
        }
    }
}
