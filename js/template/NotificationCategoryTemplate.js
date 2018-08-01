import Template from '~/template/Template';
import NotificationItemTemplate from '~/template/NotificationItemTemplate';
import NotificationButtonTemplate from '~/template/NotificationButtonTemplate';

/**
 * A category of notifications w/ a header
 */
export default class NotificationCategoryTemplate extends Template {
    /**
     * @param {NotificationCategory} notificationCategory
     * @async
     */
    constructor(notificationCategory) {

        const root = <ul class="notification-category"/>;
        super(root);

        return (async () => {
            const checkAllButton = await new NotificationButtonTemplate('Mark all as read', 'check-all');
            checkAllButton.delegate.didSetStateTo = (_, state) => {
                // TODO: mark category as fixed
            };

            root.appendChild(
                <DocumentFragment>
                    <li class="notification-category__title notification-category__stack">
                        <h3 class="notification-category__stack__primary">{notificationCategory.name}</h3>
                        <div class="notification-category__detail">
                            { checkAllButton.unique() }
                        </div>
                    </li>
                </DocumentFragment>
            );

            for (const notificationGroup of notificationCategory) {
                const notificationGroupTemplate = await new NotificationItemTemplate(notificationGroup);
                notificationGroupTemplate.loadInContext(root);
            }

            /** @type {NotificationCategory} */
            this.notificationCategory = notificationCategory;

            return this;
        })();
    }
}
