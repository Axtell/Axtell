import PublishEdit from '~/models/Request/PublishEdit';

/**
 * Deletes a given item
 * @extends {PublishEdit}
 */
export default class PublishDelete extends PublishEdit {
    /**
     * What to delete
     * @param {Post|Answer} item
     * @param {boolean} isDeleted - Set to false to undelete
     */
    constructor(item, isDeleted = true) {
        super({
            item: item,
            deleted: isDeleted
        });
    }
}
