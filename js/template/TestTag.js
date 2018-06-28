import ActionControllerDelegate from '~/delegate/ActionControllerDelegate';
import Template from '~/template/Template';

export const TagType = {
    string: { name: 'string', caption: true },
    int: { name: 'int', caption: true },
    float: { name: 'float', caption: true },
    code: { name: 'string', caption: false }
};

/**
 * The TestTag element
 */
export default class TestTag extends Template {
    /**
     * @param {TagType} type The type of the tag
     * @param {?Object} [opts={}]
     * @param {string} label The label specifying the description
     * @param {?(string[])} opts.subtypes If not null then the subtypes
     */
    constructor(type, { label, subtypes } = {}) {
        const { name, caption } = type;
        let options,
            select = null;

        if (subtypes) {
            select = (
                <select>
                    { subtypes.map(type => <option value={type}>{ type }</option>) }
                </select>
            );

            options = (
                <div class="test-tag__vertical_section test-tag__vertical_section--pad-right">
                    <span class="test-tag__type_desc">
                        { select }
                    </span>
                    { caption ? <span class="test-tag__label">type</span> : <DocumentFragment/> }
                </div>
            );
        } else {
            options = <DocumentFragment/>;
        }

        const tag = (
            <div class={`test-tag test-tag--type-${name} test-tag--icon`}>
                <div class={`test-tag__vertical_section ${ caption ? ` test-tag__vertical_section--pad-right test-tag__type_name` : ''}`}>
                    <span class="test-tag__type_desc">{ label }</span>
                </div>
                { options }
            </div>
        );

        super(tag);

        /** @type {TagType} */
        this.type = type;

        /** @type {?(string[])} */
        this.subtypes = subtypes;

        /** @type {ActionControllerDelegate} */
        this.delegate = new ActionControllerDelegate();

        this._select = select;

        select?.addEventListener('change', (e) => {
            this._didUpdateState();
        })
    }

    get state() {
        return this._select?.options[this._select.selectedIndex].value;
    }

    _didUpdateState() {
        this.delegate.didSetStateTo(this, this.state);
    }
}

window.TestTag = TestTag;
