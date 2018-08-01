import Template from '~/template/Template';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import SVG from '~/models/Request/SVG';
import tippy from 'tippy.js/dist/tippy.all.min.js';

/**
 * A little button for notifs
 */
export default class NotificationButtonTemplate extends Template {

    /**
     * @param {[type]} description description
     * @param {[type]} icon SVG icon name
     */
    constructor(description, icon) {
        const root = (
            <a title={ description } />
        );
        super(root);

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        root.addEventListener('click', () => {
            this.delegate.didSetStateTo(this, true);
        })

        return (async () => {
            const iconNode = await SVG.load(icon);
            root.appendChild(iconNode);

            tippy(root, {
                arrow: true,
                delay: 200,
                distance: 6,
                duration: [200, 150],
                placement: 'bottom',
                size: 'small'
            });

            return this;
        })();
    }

}
