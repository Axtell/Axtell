export const siteMetadata = new Map([
    ['accounts.google.com', {
        siteName: 'Google',
        siteIcon: 'login-method/google'
    }],
    ['google.com', {
        siteName: 'Google',
        siteIcon: 'login-method/google'
    }],
    ['stackexchange.com', {
        siteName: 'Stack Exchange',
        siteIcon: 'login-method/stackexchange'
    }],
    ['github.com', {
        siteName: 'GitHub',
        siteIcon: 'login-method/github'
    }]
]);

/**
 * Login method
 * @implements {JSONConvertable}
 */
export default class LoginMethod {

    /**
     * Create login method
     * @param {number} options.id         Method id
     * @param {string} options.siteName   The site name
     * @param {string} options.siteIcon   Icon for the site
     * @param {string} options.identifier The identifier for user on the site
     * @param {?Date} options.lastUsed     last used daet
     */
    constructor({ id, siteName, siteIcon, identifier, lastUsed }) {
        /** @type {number} */
        this.id = id;

        /** @type {string} */
        this.siteName = siteName;

        /** @type {string} */
        this.siteIcon = siteIcon;

        /** @type {string} */
        this.identifier = identifier;

        /** @type {Date} */
        this.lastUsed = lastUsed;
    }

    /**
     * Returns metadata for site
     * @param {string} siteName - Site information
     * @return {Object}
     * @property {string} siteName - User readable site name
     */
    static getSiteMetadata(siteName) {
        return {
            siteName: siteName,
            ...(siteMetadata.get(siteName) || {})
        };
    }

    /** @override */
    static fromJSON(json) {
        const metadataForSite = LoginMethod.getSiteMetadata(json.issuer);

        return new LoginMethod({
            id: json.id,
            siteName: metadataForSite.siteName,
            siteIcon: metadataForSite.siteIcon,
            identifier: json.identifier,
            lastUsed: json.last_used && new Date(json.last_used)
        })
    }
}
