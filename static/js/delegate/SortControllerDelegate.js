import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

/**
 * Manages a select dialog for sorting
 */
export default class SortControllerDelegate extends ActionControllerDelegate {
    didSetStateTo(controller, state) {
        // Sort Type
        let st = state.elem.dataset.st;

        if (st) {
            let params = new URLSearchParams(location.search);
            if (params.get('st') !== st) {
                params.set('st', st)
                history.replaceState({}, "", '?' + params.toString());
            }
        }
    }
}
