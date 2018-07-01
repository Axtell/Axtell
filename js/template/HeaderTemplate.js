import Template from '~/template/Template';

export default class HeaderTemplate extends Template {
    /**
     * A title
     * @param {string} title
     */
    constructor(title) {
        super(
            <div class="list-header">
                <h1>{ title }.</h1>
            </div>
        );
    }
}
