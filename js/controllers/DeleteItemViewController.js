import PostButtonViewController from '~/controllers/PostButtonViewController';
import ErrorManager, { HandleUnhandledPromise } from '~/helpers/ErrorManager';
import PublishDelete from '~/models/Request/PublishDelete';
import Analytics, { EventType } from '~/models/Analytics';
import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';

export default class DeleteItemViewController extends PostButtonViewController {
    /**
     * @param {Object} o options
     * @param {HTMLElement} o.trigger Trigger for deletion
     * @param {Post|Answer} o.item item object
     */
    constructor({ trigger, item }) {
        super(trigger);

        /** @type {Answer|Post} */
        this.item = item;
        trigger.addEventListener("click", ::this.trigger)

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();
    }

    /**
     * Attempt to delete
     */
    trigger() {
        // Ignore delete if we're loading
        if (this.isLoading) return;

        Analytics.shared.report(EventType.deleteClick(this.item));
        const isSure = window.confirm(`Are you sure you want to delete this ${this.item.endpoint}?`);
        if (isSure) {
            this.delete()
                .catch(HandleUnhandledPromise);
        }
    }

    /**
     * Deletes the item
     */
    async delete() {
        this.isLoading = true;

        const request = new PublishDelete(this.item);
        const finalResult = await request.run();
        await this.delegate.didSetStateTo(this, finalResult);

        this.isLoading = false;
    }
}
