import Data from '~/models/Data';

export const MIN_TITLE_LENGTH = Data.shared.envValueForKey('POST_TITLE_MIN');
export const MAX_TITLE_LENGTH = Data.shared.envValueForKey('POST_TITLE_MAX');
export const MIN_BODY_LENGTH = Data.shared.envValueForKey('POST_BODY_MIN');
export const MAX_BODY_LENGTH = Data.shared.envValueForKey('POST_BODY_MAX');

export const POST_ID_KEY = 'id';

export const NOT_A_POST = Symbol('Post.NotAPost');

/**
 * Describes a code-golf post
 */
export default class Post {
    /**
     * Pass all parameters as **object**
     * @param {number} postId - Id of post.
     */
    constructor({ postId }) {
        this._id = postId;
    }

    /**
     * @type {number}
     */
    get id() { return this._id; }

    static _currentPost = null;
    /**
     * The current post
     * @type {Post}
     */
    static get current() {
        if (Post._currentPost === NOT_A_POST) return null;
        if (Post._currentPost !== null) return Post._currentPost;

        let postId = Data.shared.valueForKey(POST_ID_KEY);
        if (postId === null) {
            Post._currentPost = NOT_A_POST;
            return null;
        }

        return new Post({ postId });
    }
}
