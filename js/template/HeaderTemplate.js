import Template from '~/template/Template';

export default class HeaderTemplate extends Template {
    /**
     * A title
     * @param {string} title
     * @param {?string} opts.subtitle Optional subtitle. If not provided initially then cannot be set later
     */
    constructor(title, { subtitle = null } = {}) {
        super(<div/>);

        this.underlyingNode.appendChild(
            <DocumentFragment>
                <div class="list-header">
                    <h1>{ title }.</h1>
                </div>
                { subtitle ? (
                    <div class="list-header list-header--style-caption">
                        <h2 class="header--style-caption">{ this.defineLinkedText('subtitle', subtitle) }</h2>
                    </div>
                ) : <DocumentFragment/> }
            </DocumentFragment>
        );
    }
}
