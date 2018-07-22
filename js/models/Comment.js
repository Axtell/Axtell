import ErrorManager from '~/helpers/ErrorManager';
import Data from '~/models/Data';
import User from '~/models/User';

export const INVALID_JSON = Symbol('Comment.Error.InvalidJSON');
export const COMMENT_COUNT = Data.shared.envValueForKey('COMMENT_COUNT');

/**
 * Represents a comment
 */
export default class Comment {
    /**
     * Creates a new comment
     * @param  {number} options.id       the comment id
     * @param  {string} options.text     comment body
     * @param  {string} options.type     answer or post
     * @param  {number} options.sourceId ID of the type (e.g. the answer id or post id)
     * @param  {Comment} options.parent  parent comment object
     * @param  {Date} options.date       JavaScript date object representing creation time
     * @param  {User} options.owner      The owner of the comment
     * @param  {Array}  options.children The child comments
     */
    constructor({
        id,
        text,
        type,
        sourceId,
        parent = null,
        date,
        owner,
        children = []
    }) {
        /** @type {number} */
        this.id = id;

        /** @type {string} */
        this.text = text;

        /** @type {string} */
        this.type = type;

        /** @type {number} */
        this.sourceId = sourceId;

        /** @type {?Comment} */
        this.parent = parent;

        /** @type {Date} */
        this.date = date;

        /** @type {User} */
        this.owner = owner;

        /**
         * `false` means they are children but not listed
         * @type {Comment[]}
         */
        this.children = children;
    }

    /**
     * Converts to JSON object. NOTE: parent is null because we can't have a
     * circular JSON. You may want to implement something like assembleParents as
     * {@link Comment#fromJSON} does.
     *
     * @return {Object} JSON object
     */
    toJSON() {
        const json = {
            id: this.id,
            text: this.text,
            parent: null,
            date: this.date,
            owner: this.owner,
            children: this.children && this.children.map(child => child.toJSON())
        }

        return json;
    }

    /**
     * Unwraps from an API JSON object.
     * @param {Object} json User JSON object.
     * @param {?boolean} [assembleParents=false] If the comment model does not have cyclic parent <-> childs this can be linked here
     * @return {?Answer} object if succesful, `null` if unauthorized.
     * @throws {TypeError} if invalid JSON object
     */
    static fromJSON(json, assembleParents = false) {
        // Unwrap all json parameters
        const {
            id,
            text,
            ty: type,
            source_id: sourceId,
            parent = null,
            date,
            owner,
            children = []
        } = json;

        if (!id || !text || !date || !text || !owner) {
            ErrorManager.raise(`Incomplete Comment JSON`, INVALID_JSON);
        }

        const comment = new Comment({
            id,
            text,
            type,
            sourceId,
            parent: parent ? Comment.fromJSON(parent) : null,
            children: null,
            date: new Date(date),
            owner: User.fromJSON(owner)
        });

        comment.children = children && children.map(child => {
            const childComment = Comment.fromJSON(child, assembleParents);
            if (assembleParents) childComment.parent = comment;
            return childComment;
        })

        return comment;
    }
}
