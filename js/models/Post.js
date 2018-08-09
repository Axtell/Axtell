import Data from '~/models/Data';
import User from '~/models/User';
import CanonicalPostURL from '~/models/Request/CanonicalPostURL';

export const MIN_TITLE_LENGTH = Data.shared.envValueForKey('POST_TITLE_MIN');
export const MAX_TITLE_LENGTH = Data.shared.envValueForKey('POST_TITLE_MAX');
export const MIN_BODY_LENGTH = Data.shared.envValueForKey('POST_BODY_MIN');
export const MAX_BODY_LENGTH = Data.shared.envValueForKey('POST_BODY_MAX');

export const POST_JSON_KEY = 'post';

export const NOT_A_POST = Symbol('Post.NotAPost');

/**
 * Describes a code-golf post
 */
export default class Post {
    /**
     * Pass all parameters as **object**
     * @param {number} postId - Id of post.
     * @param {string} title - Post title
     * @param {?string} body - Post body
     * @param {boolean} [isDeleted=false] - True if is deleted
     * @param {string} slug - Slug of post
     * @param {?User} owner - Owner of post
     */
    constructor({ postId, title, body = null, slug = null, isDeleted = false, owner = null }) {
        this._id = postId;
        this._title = title;
        this._body = body;
        this._owner = owner;
        this._slug = slug;
        this._deleted = isDeleted;
    }

    /** @type {boolean} */
    get isDeleted() { return this._deleted; }

    /** @type {boolean} */
    set isDeleted(isDeleted) { this._deleted = isDeleted; }

    /** @type {number} */
    get id() { return this._id; }

    /** @type {string} */
    get title() { return this._title; }

    /** @type {?string} */
    get body() { return this._body; }

    /** @type {?User} */
    get owner() { return this._owner; }

    /**
     * General endpoint for this type of model
     * @type {string}
     */
    get endpoint() { return 'post' }

    /**
     * Converts from JSON
     * @return {Post}
     */
    static fromJSON(json) {
        return new Post({
            postId: json.id,
            title: json.title,
            body: json.body || null,
            slug: json.slug || null,
            owner: User.fromJSON(json.owner),
            isDeleted: json.deleted
        })
    }

    /**
     * Returns the canonical URL
     * @type {string}
     */
    async getURL() {
        let slug;
        if (!this._slug) {
            slug = await new CanonicalPostURL(this).run();
        } else {
            slug = this._slug;
        }

        return `${Data.shared.envValueForKey('HOST')}/post/${post.id}/${slug}`;
    }

    /**
     * Gets the description for this post
     */
    async getDescription() {
        const currentDescription = document.querySelector('meta[name=description]')?.content;
        if (Post.current?.id === this.id && currentDescription) {
            // If the current post is loaded get the link description from HTML
            return currentDescription;
        } else {
            return new CanonicalPostDescription(this);
        }
    }

    /**
     * Generates a "QAPost" schema
     */
    async getSchema() {
        const canonicalURL = await this.getURL();
        const description = await this.getDescription();

        return ({
            "@context": "http://schema.org",
            "@type": "QAPage",
            author: await this.owner.getSchema(),
            breadcrumb: {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@id": `${Data.shared.envValueForKey('HOST')}/posts`,
                            "name": "Posts"
                        }
                   }
                ]
            },
            description: description,
            identifier: canonicalURL,
            mainContentOfPage: {
                cssSelector: ".body"
            },
            name: this.title,
            text: description,
            url: canonicalURL,
        });
    }

    /**
     * Converts to json
     * @return {Object} json object
     */
    toJSON() {
        return {
            type: 'post',
            body: this.body || undefined,
            id: this.id,
            deleted: this.isDeleted
        };
    }

    static _currentPost = null;
    /**
     * The current post
     * @type {Post}
     */
    static get current() {
        if (Post._currentPost === NOT_A_POST) return null;
        if (Post._currentPost !== null) return Post._currentPost;

        let postJson = Data.shared.encodedJSONForKey(POST_JSON_KEY);
        if (postJson === null) {
            Post._currentPost = NOT_A_POST;
            return null;
        }

        return Post.fromJSON(postJson);
    }
}
