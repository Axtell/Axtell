import Template from '~/template/Template';
import NotificationItemTemplate from '~/template/NotificationItemTemplate';

/**
 * A category of notifications w/ a header
 */
export default class NotificationCategoryemplate extends Template {
    /**
     * @param {NotificationCategory} notificationCategory
     */
    constructor(notificationCategory) {
        const root = (
            <ul class="notification-category">
                <li class="notification-category__title">{notificationCategory.name}</li>
            </ul>
        );

        for (const notificationGroup of notificationCategory) {
            new NotificationItemTemplate(notificationGroup).loadInContext(root);
        }

        super(root);

        /** @type {NotificationCategory} */
        this.notificationCategory = notificationCategory;
    }
}
