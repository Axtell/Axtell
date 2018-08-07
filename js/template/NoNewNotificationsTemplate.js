import Template from '~/template/Template';
import SVG from '~/models/Request/SVG';

export default class NoNewNotificationsTemplate extends Template {
    constructor() {
        const root = <div class="notification-list__empty"/>;
        super(root);

        return (async () => {
            const icon = await SVG.load('bell');

            root.appendChild(
                <DocumentFragment>
                    { icon }
                    <h2>All caught up!</h2>
                    <h3>You have no notifications left to read.</h3>
                </DocumentFragment>
            );

            return this;
        })();
    }
}
