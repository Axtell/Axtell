import Data from '~/models/Data';
import User from '~/models/User';

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
     * @param {?User} owner - Owner of post
     */
    constructor({ postId, title, body = null, owner = null }) {
        this._id = postId;
        this._title = title;
        this._body = body;
        this._owner = owner;
    }

    /** @type {number} */
    get id() { return this._id; }

    /** @type {string} */
    get title() { return this._title; }

    /** @type {?string} */
    get body() { return this._body; }

    /** @type {?User} */
    get owner() { return this.owner; }

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
            body: json.body,
            owner: User.fromJSON(json.owner)
        })
    }

    /**
     * Converts to json
     * @return {Object} json object
     */
    toJSON() {
        return {
            type: 'post',
            body: this.body,
            id: this.id
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
