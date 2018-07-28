import LoadingIcon from '~/svg/LoadingIcon';
import SwappingTemplate from '~/template/SwappingTemplate';

/**
 * Displays loading sign then goes away. Use {@link LoadingTemplate#controller}'s {@link SwappingViewController#displayAlternate}
 */
export default class LoadingTemplate extends SwappingTemplate {
    /**
     * Creates the loading template.
     * @override
     */
    constructor(user, followType) {
        super(
            <div class="template--root">
                { LoadingIcon.cloneNode(true) }
                <h2>Loading...</h2>
            </div>
        );
    }
}
