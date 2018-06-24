import PublishEdit from '~/models/Request/PublishEdit';

export default class PublishDelete extends PublishEdit {
    /**
     * What to delete
     * @param {Post|Answer} item
     */
    constructor(item) {
        super({
            item: item,
            deleted: true
        });
    }
}
