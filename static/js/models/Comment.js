import ErrorManager from '~/helpers/ErrorManager';
import User from '~/models/User';

export const INVALID_JSON = Symbol('Comment.Error.InvalidJSON');

/**
 * Represents a comment
 */
export default class Comment {
    /**
     * Creates a new comment
     * @param  {number} options.id       the comment id
     * @param  {string} options.text     comment body
     * @param  {Comment} options.parent  parent comment object
     * @param  {Date} options.date       JavaScript date object representing creation time
     * @param  {User} options.owner      The owner of the comment
     * @param  {Array}  options.children The child comments
     */
    constructor({
        id,
        text,
        parent = null,
        date,
        owner,
        children = []
    }) {
        /** @type {number} */
        this.id = id;

        /** @type {string} */
        this.text = text;

        /** @type {?Comment} */
        this.parent = parent;

        /** @type {Date} */
        this.date = date;

        /** @type {User} */
        this.owner = owner;

        /** @type {Comment[]} */
        this.children = children;
    }

    /**
     * Unwraps from an API JSON object.
     * @param {Object} json User JSON object.
     * @return {?Answer} object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json) {
        // Unwrap all json parameters
        const {
            id,
            text,
            parent = null,
            date,
            owner,
            children = []
        } = json;

        if (!id || !text || !date || !text || !owner) {
            ErrorManager.raise(`Incomplete Comment JSON`, INVALID_JSON);
        }

        return new Comment({
            id,
            text,
            parentComment: parent && Comment.fromJSON(parent),
            children: children.map(Comment.fromJSON),
            date: new Date(date),
            owner: User.fromJSON(owner)
        });
    }
}
